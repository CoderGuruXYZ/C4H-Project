import numpy as np
import pandas as pd
import requests
from PyQt5.QtWidgets import *
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QTextOption
from sklearn.linear_model import LinearRegression
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from bs4 import BeautifulSoup
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas

from database import Database
from interest_rate_webscraped import get_bank_rate
import AI_features as ai


class BudgetManagerApp(QTabWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("WealthLink Budget Manager")
        self.setStyleSheet(self.app_styles())

        self.db = Database()    # initialises database
        self.analyser = SentimentIntensityAnalyzer()    # initialises sentiment analyser

        self.previous_market_mood = None    # tracks previous states of market mood and interest rate so it can alert the user if there are any changes
        self.previous_interest_rate = None

        self.saved_salary = self.db.load_setting('salary')
        self.saved_goal = self.db.load_setting('goal')

        self.budget_tab = QWidget()     # setup UI tabs
        self.market_tab = QWidget()
        self.addTab(self.budget_tab, "Budget Overview")
        self.addTab(self.market_tab, "Market Insights")

        self.setup_budget_ui()  # builds both tabs
        self.setup_market_ui()
        self.refresh_expense_table()    # adds entries

    def app_styles(self):
        return """
        /* Main Window Styles */
        QWidget {
            font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
            background-color: #f9fafb;
            color: #111827;
            font-size: 13px;
        }
        
        /* Tab Widget */
        QTabWidget::pane {
            border: none;
            padding: 12px;
        }
        QTabBar::tab {
            background: #e5e7eb;
            color: #4b5563;
            padding: 10px 20px;
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
            margin-right: 4px;
            font-weight: 500;
        }
        QTabBar::tab:selected {
            background: #ffffff;
            color: #111827;
            font-weight: 600;
            border-bottom: 2px solid #3b82f6;
        }
        QTabBar::tab:hover {
            background: #d1d5db;
        }
        
        /* Headers and Titles */
        QLabel#title {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 16px;
        }
        QLabel#subtitle {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin: 8px 0;
        }
        QLabel#section_header {
            font-size: 14px;
            font-weight: 600;
            color: #4b5563;
            margin: 12px 0 4px 0;
        }
        
        /* Buttons */
        QPushButton {
            background-color: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 16px;
            font-weight: 500;
            min-width: 100px;
        }
        QPushButton:hover {
            background-color: #2563eb;
        }
        QPushButton:pressed {
            background-color: #1d4ed8;
        }
        QPushButton:disabled {
            background-color: #9ca3af;
        }
        
        /* Special Buttons */
        QPushButton#ai_button {
            background-color: #8b5cf6;
        }
        QPushButton#ai_button:hover {
            background-color: #7c3aed;
        }
        QPushButton#danger_button {
            background-color: #ef4444;
        }
        QPushButton#danger_button:hover {
            background-color: #dc2626;
        }
        
        /* Input Fields */
        QLineEdit, QDoubleSpinBox, QTextEdit {
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 8px 12px;
            background-color: white;
            min-height: 36px;
        }
        QLineEdit:focus, QTextEdit:focus {
            border: 1px solid #3b82f6;
            outline: none;
        }
        
        /* Tables */
        QTableWidget {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            gridline-color: #f3f4f6;
            selection-background-color: #dbeafe;
            selection-color: #1e40af;
        }
        QHeaderView::section {
            background-color: #f9fafb;
            color: #374151;
            font-weight: 600;
            padding: 8px;
            border: none;
            border-bottom: 1px solid #e5e7eb;
        }
        QTableCornerButton::section {
            background-color: #f9fafb;
            border: none;
            border-bottom: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
        }
        
        /* Progress Bar */
        QProgressBar {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            text-align: center;
            height: 28px;
            background-color: white;
        }
        QProgressBar::chunk {
            background-color: #10b981;
            border-radius: 7px;
        }
        
        /* Cards */
        QFrame#card {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
        }
        
        /* Spacing */
        QVBoxLayout > * {
            margin-bottom: 12px;
        }
        QHBoxLayout > * {
            margin-right: 8px;
        }
        """

    def setup_budget_ui(self):
        layout = QVBoxLayout()

        self.salary_display = QLabel()      # displays monthly salary and saving goals using Qlabel
        self.goal_display = QLabel()
        self.update_salary_goal_display()

        layout.addWidget(self.salary_display)
        layout.addWidget(self.goal_display)

        self.desc_input = QLineEdit()   # expense input
        self.amount_input = QLineEdit()
        self.salary_input = QLineEdit()
        self.saving_input = QLineEdit()
        self.expense_table = QTableWidget()
        self.health_bar = QProgressBar()

        layout.addWidget(QLabel("Expense Description:"))
        layout.addWidget(self.desc_input)

        layout.addWidget(QLabel("Amount (£):"))
        layout.addWidget(self.amount_input)

        layout.addWidget(QLabel("Monthly Salary (£):"))
        layout.addWidget(self.salary_input)

        layout.addWidget(QLabel("Saving Goal (£):"))
        layout.addWidget(self.saving_input)

        set_btn = QPushButton("Set Salary and Savings")     # set monthly salary and savings
        set_btn.clicked.connect(self.force_set_salary_goal)
        layout.addWidget(set_btn)

        add_btn = QPushButton("Add Expense")    # add expense button
        add_btn.clicked.connect(self.add_expense)
        layout.addWidget(add_btn)
        layout.addSpacing(12)

        for text, func in [                                                     # AI features
            ("AI Financial Advice", self.show_financial_advice),
            ("AI Saving Plan", self.show_saving_plan),
            ("AI Monthly Financial Report", self.show_monthly_report),
            ("Export Spending with AI Summary", self.export_summary)
        ]:
            btn = QPushButton(text)
            btn.clicked.connect(func)
            layout.addWidget(btn)

        layout.addSpacing(10)

        reset_btn = QPushButton("Clear All Spending Data")  # clears expenses table when buttom clicked
        reset_btn.clicked.connect(self.reset_expenses)
        layout.addWidget(reset_btn)

        layout.addWidget(self.expense_table)
        layout.addWidget(self.health_bar)   # adds budget health bar
        self.budget_tab.setLayout(layout)

    def update_salary_goal_display(self):   # updates display lables for salary and saving goal
        if self.saved_salary:
            self.salary_display.setText(f"Monthly Salary: £{self.saved_salary:.2f}")
        else:
            self.salary_display.setText("Monthly Salary: Not Set")

        if self.saved_goal:
            self.goal_display.setText(f"Saving Goal: £{self.saved_goal:.2f}")
        else:
            self.goal_display.setText("Saving Goal: Not Set")

    def force_set_salary_goal(self):    # lets user set saving goal and monthly salary
        try:
            entered_salary = float(self.salary_input.text())
            entered_goal = float(self.saving_input.text())

            if self.saved_salary is not None:
                if entered_salary > self.saved_salary:
                    QMessageBox.information(self, "Well Done!", "Congratulations on your pay rise!")    # checks in settings database and if new salary is higher, it offers congratulations on pay rise

            self.saved_salary = entered_salary
            self.saved_goal = entered_goal

            self.db.save_setting('salary', entered_salary)
            self.db.save_setting('goal', entered_goal)

            self.update_salary_goal_display()
            QMessageBox.information(self, "Saved", "Your salary and saving target have been updated.")
        except ValueError:
            QMessageBox.warning(self, "Input Error", "Please enter valid numbers for both salary and saving goal.")

    def get_salary(self):
        return self.saved_salary if self.saved_salary is not None else 3000

    def get_goal(self):
        return self.saved_goal if self.saved_goal is not None else 500

    def update_health_bar(self):        # updates health bar based on remaining budget
        monthly_income = self.get_salary()
        target_saving = self.get_goal()
        df = self.db.get_expenses()

        total_spent = df['amount'].sum() if 'amount' in df.columns and not df.empty else 0
        budget_limit = monthly_income - target_saving
        remaining_budget = max(budget_limit - total_spent, 0)

        if budget_limit <= 0:   # prevents divison by 0 which is a maths error
            budget_limit = 1

        progress = int((remaining_budget / budget_limit) * 100)
        self.health_bar.setFormat(f"Budget Remaining: £{remaining_budget:.2f}")
        self.health_bar.setValue(progress)

        if progress > 50:
            colour = "#09FF42"
        elif progress > 20:
            colour = "#ffcf40"
        else:
            colour = "#f70000"

        self.health_bar.setStyleSheet(f"QProgressBar::chunk {{ background-color: {colour}; border-radius: 6px; }}")

    def add_expense(self):      # adds new expense to database with automatic categorisation using gemini and also a mood score.
        desc = self.desc_input.text()
        try:
            amount = float(self.amount_input.text())
        except ValueError:
            QMessageBox.warning(self, "Input Error", "Please provide a valid number for amount.")
            return

        category = ai.category_sugg(desc)
        mood_score = self.analyser.polarity_scores(desc)['compound']
        if mood_score < -0.3 and category != "Emergency/Unexpected":
            category = "Emergency/Unexpected"

        self.db.add_expense(desc, amount, category)
        self.desc_input.clear()
        self.amount_input.clear()
        self.refresh_expense_table()

    def refresh_expense_table(self):    # refreshes table and health bar every time new data comes in
        df = self.db.get_expenses()
        self.expense_table.setRowCount(len(df))
        self.expense_table.setColumnCount(3)
        self.expense_table.setHorizontalHeaderLabels(["Description", "Amount (£)", "Category"])

        for row_idx, row in df.iterrows():
            for col_idx, val in enumerate(row):
                cell = QTableWidgetItem(str(val))
                cell.setTextAlignment(Qt.AlignCenter)
                self.expense_table.setItem(row_idx, col_idx, cell)

        self.update_health_bar()

    def reset_expenses(self):      # clears expense table and resets monhtly salary and saving goal label
        reply = QMessageBox.question(
            self,
            "Confirm Reset",
            "Are you sure you want to delete all spending data and reset your salary and goal?",
            QMessageBox.Yes | QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            self.db.clear_expenses()    # clears from expense db
            self.db.clear_settings()    # clears from settings db
            self.saved_salary = None
            self.saved_goal = None
            self.salary_input.clear()
            self.saving_input.clear()
            self.update_salary_goal_display()
            self.refresh_expense_table()

    def setup_market_ui(self):      # creates market insight tab layout
        layout = QVBoxLayout()

        self.sentiment_frame = QFrame()
        sentiment_layout = QVBoxLayout()
        sentiment_layout.setContentsMargins(20, 20, 20, 20)
        sentiment_layout.setSpacing(12)

        self.rate_label = QLabel("Interest Rate: Not Available")
        self.rate_label.setStyleSheet("font-size: 12pt; font-weight: 600;")
        sentiment_layout.addWidget(self.rate_label)

        self.sentiment_label = QLabel("Market Mood: Unknown")
        self.sentiment_label.setStyleSheet("font-size: 12pt; font-weight: 600;")
        sentiment_layout.addWidget(self.sentiment_label)

        self.crisis_box = QTextEdit()
        self.crisis_box.setReadOnly(True)
        self.crisis_box.setPlaceholderText("AI Crisis Risk summary will appear here...")
        self.crisis_box.setMinimumHeight(150)
        self.crisis_box.setStyleSheet("""
            QTextEdit {
                background-color: #ffffff;
                border-radius: 8px;
                padding: 10px;
                font-size: 11pt;
            }
        """)
        sentiment_layout.addWidget(self.crisis_box)

        self.sentiment_frame.setLayout(sentiment_layout)
        self.sentiment_frame.setStyleSheet("background-color: white; border-radius: 12px;")
        layout.addWidget(self.sentiment_frame)

        refresh_btn = QPushButton("Refresh Market Info")
        export_btn = QPushButton("Export Market Data")

        button_style = """
            QPushButton {
                background-color: #0D6EFD;
                color: white;
                border-radius: 8px;
                padding: 10px 20px;
            }
            QPushButton:hover {
                background-color: #0b5ed7;
            }
        """
        refresh_btn.setStyleSheet(button_style)
        export_btn.setStyleSheet(button_style)

        refresh_btn.clicked.connect(self.refresh_market_info)
        export_btn.clicked.connect(self.export_market_info)

        layout.addWidget(refresh_btn)
        layout.addWidget(export_btn)

        self.market_tab.setLayout(layout)

    def refresh_market_info(self):
        try:
            latest_rate = get_bank_rate()
            if latest_rate != self.previous_interest_rate:
                if self.previous_interest_rate is not None:
                    QMessageBox.information(
                        self,
                        "Interest Rate Change",
                        f"The Bank of England interest rate has changed from {self.previous_interest_rate} to {latest_rate}."
                    )
                self.previous_interest_rate = latest_rate
            self.rate_label.setText(f"Interest Rate: {latest_rate}")

            rss_feed = requests.get("https://news.google.com/rss/search?q=finance", timeout=10)
            soup = BeautifulSoup(rss_feed.content, "html.parser")
            headlines = [item.title.text for item in soup.find_all('item')[:20]]

            sentiment_scores = []
            for headline in headlines:
                score = self.analyser.polarity_scores(headline)['compound']
                sentiment_scores.append(score)

            avg_mood = np.mean(sentiment_scores)
            if avg_mood > 0.2:
                mood = "Positive"           # background colour dependent on market sentiment
                gradient_css = """                                              
                    QFrame {
                        background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                            stop:0 #a7f3d0,
                            stop:1 #ffffff);
                        border-radius: 12px;
                    }
                """
            elif avg_mood < -0.2:
                mood = "Negative"
                gradient_css = """
                    QFrame {
                        background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                            stop:0 #fecaca,
                            stop:1 #ffffff);
                        border-radius: 12px;
                    }
                """
            else:
                mood = "Neutral"
                gradient_css = """
                    QFrame {
                        background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                            stop:0 #fde68a,
                            stop:1 #ffffff);
                        border-radius: 12px;
                    }
                """

            self.sentiment_frame.setStyleSheet(gradient_css)

            if (
                    self.previous_market_mood in ["Positive", "Negative"]
                    and mood != self.previous_market_mood
                    and mood in ["Positive", "Negative"]
            ):
                if mood == "Positive":
                    QMessageBox.information(self, "Market Opportunity", "Market sentiment has turned positive. Could be a good time to review your investments!")       # If sentiment change, popup to alert user
                elif mood == "Negative":
                    QMessageBox.warning(self, "Market Warning", "Market sentiment has turned negative. Caution advised for financial decisions.")

            self.previous_market_mood = mood
            self.sentiment_label.setText(f"Market Mood: {mood}")

            crisis_msg = ai.AI_financial_news(headlines)
            self.crisis_box.setPlainText(crisis_msg)

        except Exception as e:
            self.sentiment_label.setText(f"Error fetching market data: {e}")


    def export_market_info(self):   # allows user to save current market info as a .txt file
        path, _ = QFileDialog.getSaveFileName(self, "Save Market Info", "", "Text Files (*.txt)")
        if path:
            with open(path, 'w') as f:
                f.write(f"{self.rate_label.text()}\n{self.sentiment_label.text()}\n{self.crisis_label.text()}")
            QMessageBox.information(self, "Export Done", "Market information saved.")

    def show_financial_advice(self):        # this section calls from AI_features.py and calls gemini to generate different parts of budgeting
        df = self.db.get_expenses()
        advice = ai.AI_financial_advice(df.to_csv(index=False), self.get_salary(), self.get_goal(), self.health_bar.value())
        self.show_dialog(advice, "AI Financial Advice")


    def show_saving_plan(self):
        df = self.db.get_expenses()
        plan = ai.AI_saving_plan(df.to_csv(index=False), self.get_salary(), self.get_goal())
        self.show_dialog(plan, "AI Saving Plan")


    def show_monthly_report(self):
        df = self.db.get_expenses()
        report = ai.AI_monthly_report(df.to_csv(index=False))
        self.show_dialog_with_pie(report, "AI Monthly Financial Report")


    def export_summary(self):   # allows user to export expenses and AI spending summary
        path, _ = QFileDialog.getSaveFileName(self, "Export Spending Summary", "", "CSV Files (*.csv)")
        if path:
            df = self.db.get_expenses()
            df.to_csv(path, index=False)
            summary_text = ai.AI_summary(df.to_csv(index=False))
            with open(path.replace('.csv', '_AI_Summary.txt'), 'w') as f:
                f.write(summary_text)
            QMessageBox.information(self, "Export Complete", "Your spending data and AI summary have been saved.")

    def show_dialog(self, text, title):     # standard popup for text output
        dialog = QDialog(self)
        dialog.setWindowTitle(title)
        dialog.resize(900, 650)

        layout = QVBoxLayout()
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)

        title_label = QLabel(title)
        title_label.setStyleSheet("""
            QLabel {
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 18pt;
                font-weight: bold;
                margin-bottom: 12px;
            }
        """)
        layout.addWidget(title_label)

        text_box = QTextEdit()  # text display box
        text_box.setReadOnly(True)
        text_box.setWordWrapMode(QTextOption.WordWrap)
        text_box.setPlainText(text)
        text_box.setStyleSheet("""
            QTextEdit {
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 11.5pt;
                padding: 12px;
                border: 1px solid #ccc;
                border-radius: 10px;
                background-color: #f9f9f9;
            }
        """)
        layout.addWidget(text_box)

        close_btn = QPushButton("Close")
        close_btn.setFixedWidth(120)
        close_btn.clicked.connect(dialog.accept)
        close_btn.setStyleSheet("""
            QPushButton {
                background-color: #0D6EFD;
                color: white;
                font-size: 11pt;
                padding: 8px 16px;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #0b5ed7;
            }
        """)
        layout.addWidget(close_btn, alignment=Qt.AlignRight)

        dialog.setLayout(layout)
        dialog.exec_()


    def show_dialog_with_pie(self, text, title):    # popup with both text and piechart
        dialog = QDialog(self)
        dialog.setWindowTitle(title)
        dialog.resize(1000, 750)

        layout = QVBoxLayout()
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)

        title_label = QLabel(title)
        title_label.setStyleSheet("""
            QLabel {
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 18pt;
                font-weight: bold;
                margin-bottom: 12px;
            }
        """)
        layout.addWidget(title_label)

        text_box = QTextEdit()
        text_box.setReadOnly(True)
        text_box.setWordWrapMode(QTextOption.WordWrap)
        text_box.setPlainText(text)
        text_box.setStyleSheet("""
            QTextEdit {
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 11.5pt;
                padding: 12px;
                border: 1px solid #ccc;
                border-radius: 10px;
                background-color: #f9f9f9;
            }
        """)
        text_box.setMaximumHeight(800)
        layout.addWidget(text_box)

        df = self.db.get_category_totals()      # pie chart for better visualisation for user
        if not df.empty:
            fig, ax = plt.subplots(figsize=(5, 5))
            ax.pie(df['total'], labels=df['category'], autopct='%1.1f%%', startangle=140)
            ax.set_title('Spending Breakdown by Category', fontsize=14, fontweight='bold')
            canvas = FigureCanvas(fig)
            layout.addWidget(canvas)

        close_btn = QPushButton("Close")
        close_btn.setFixedWidth(120)
        close_btn.clicked.connect(dialog.accept)
        close_btn.setStyleSheet("""
            QPushButton {
                background-color: #0D6EFD;
                color: white;
                font-size: 11pt;
                padding: 8px 16px;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #0b5ed7;
            }
        """)
        layout.addWidget(close_btn, alignment=Qt.AlignRight)

        dialog.setLayout(layout)
        dialog.exec_()

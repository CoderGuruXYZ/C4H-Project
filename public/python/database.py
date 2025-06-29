import sqlite3
import pandas as pd

class Database:
    def __init__(self, db_name='budget.db'):
        self.connection = sqlite3.connect(db_name)     # connect to SQLite database
        self.cursor = self.connection.cursor()
        self._create_expenses_table()
        self._create_settings_table()

    def _create_expenses_table(self):   # creates expenses table if it doens't exist and it tracks expenses
        self.cursor.execute('''
                            CREATE TABLE IF NOT EXISTS expenses (
                                                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                    description TEXT,
                                                                    amount REAL,
                                                                    category TEXT
                            )
                            ''')
        self.connection.commit()

    def _create_settings_table(self):   # creates settings table if it doesn't already exist and it tracks settings(e.g monthly salary and savings target)
        self.cursor.execute('''
                            CREATE TABLE IF NOT EXISTS settings (
                                                                    key TEXT PRIMARY KEY,
                                                                    value REAL
                            )
                            ''')
        self.connection.commit()

    def add_expense(self, description, amount, category):   # adds a new expense to the expense table
        self.cursor.execute(
            "INSERT INTO expenses (description, amount, category) VALUES (?, ?, ?)",
            (description, amount, category)
        )
        self.connection.commit()

    def get_expenses(self):     # fetches all expenses records from expenses database in the form of a panda dataframe to more easily display in the PyQt table wigdet
        return pd.read_sql_query(
            "SELECT description, amount, category FROM expenses", self.connection
        )

    def get_category_totals(self):
        return pd.read_sql_query(
            "SELECT category, SUM(amount) AS total FROM expenses GROUP BY category",
            self.connection
        )

    def clear_expenses(self):     # deletes all records from expense table
        self.cursor.execute("DELETE FROM expenses")
        self.connection.commit()

    def save_setting(self, key, value):     # saves or updates setting into settings table. If it exists, it gets replaced
        self.cursor.execute(
            "REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value)
        )
        self.connection.commit()

    def load_setting(self, key):
        self.cursor.execute(
            "SELECT value FROM settings WHERE key = ?", (key,)
        )
        result = self.cursor.fetchone()
        return result[0] if result else None

    def clear_settings(self):       # deletes all settings from settings  table
        self.cursor.execute("DELETE FROM settings")
        self.connection.commit()

import sys
from PyQt5.QtWidgets import QApplication
from ui import BudgetManagerApp     # imports main application window from ui.py

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = BudgetManagerApp()
    window.resize(365, 1000)    # made it so when it appears the size looks nice
    window.show()
    sys.exit(app.exec_())
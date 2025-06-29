import requests     # for making http requests
from bs4 import BeautifulSoup       # for parsing HTML for webscraping

def get_bank_rate():
    try:
        url = "https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp"      # bank ofof england (for interest rate)
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)       # HTTP get request with 10 sec timeout

        if response.status_code != 200:     # if doesn't return ok, return error
            return "Error fetching Bank Rate: Site returned bad status."

        soup = BeautifulSoup(response.text, "html.parser")      # parse HTML of web page

        rate_div = soup.find('div', class_='hero-card__value')  # looked on the wesbite and found interest rate is specifically in a div wiht this class

        if rate_div:    # if div found rreturn
            rate_text = rate_div.get_text(strip=True)
            return rate_text

        table = soup.find('table')      # checks table as backup
        if table:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                for cell in cells:
                    text = cell.get_text(strip=True)
                    if "%" in text or text.replace('.', '', 1).isdigit():
                        return text + '%'

        return "Bank Rate not found on page."       # if both fail, return error essnetially
    except Exception as e:      # for any unexpected errors
        return f"Error fetching Bank Rate: {e}"

import google.generativeai as genai
import pandas as pd

genai.configure(api_key='AIzaSyAkbTqBTdIZrF5SLdvuoYNhiqDvi6Rp5B8')  # configures gemini API with personal API key


def call_gemini(prompt_text):   # gives prompt to gemini and returns generated message. Also makes it so that if there is an error it won#t crash the whole app but just return an error message
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content([prompt_text])
        return response.text
    except Exception as error:
        return f"AI Error: {error}"


def AI_financial_advice(expense_csv, salary, goal, health_score, interest_rate, market_mood):       # It generates personalised financial advice based on user's budget, savings goal, and also the current interest rate, and market sentiment.
    prompt = (
        f"You are a friendly, practical financial advisor. Analyse this user's budget and the current UK market conditions:\n\n"
        f"User's Budget Information:\n"
        f"- Monthly Salary: £{salary}\n"
        f"- Saving Goal: £{goal}\n"
        f"- Budget Health Score: {health_score}%\n"
        f"- Current Expenses:\n{expense_csv}\n\n"
        f"Current Market Conditions:\n"
        f"- Bank of England Interest Rate: {interest_rate}\n"
        f"- Overall Market Sentiment: {market_mood}\n\n"
        f"Based on both the user's finances and the market, give 3-5 clear, realistic, human-like pieces of financial advice.\n"
        f"Focus on budgeting, saving, spending decisions, and whether it may be a good or bad time for big financial moves (e.g., investing, making large purchases, or selling property).\n"
        f"Write in a supportive, simple tone for everyday users."
    )
    return call_gemini(prompt)


def AI_saving_plan(expense_csv, salary, goal, interest_rate, market_mood):  # Generates a saving plan based on the user's income, saving goal, spending history, and also considers the current interest rate and market sentiment.
    prompt = (
        f"You are a savings and budgeting expert. This user wants help creating a realistic saving plan for next month.\n\n"
        f"User's Financial Situation:\n"
        f"- Monthly Salary: £{salary}\n"
        f"- Saving Goal: £{goal}\n"
        f"- Current Expenses:\n{expense_csv}\n\n"
        f"Current UK Market Factors:\n"
        f"- Bank of England Interest Rate: {interest_rate}\n"
        f"- Market Sentiment: {market_mood}\n\n"
        f"Considering both their financial situation and market conditions, suggest a step-by-step saving plan for the next month.\n"
        f"Be specific with spending cuts, category adjustments, and any smart timing suggestions (e.g., delay big purchases if market is negative).\n"
        f"Keep the tone encouraging and practical."
    )
    return call_gemini(prompt)



def AI_monthly_report(expense_csv):    # creates a monthly report which the user can download
    prompt = (
        f"Create a clear, well-structured monthly financial report for this user based on the following spending data:\n"
        f"{expense_csv}\n\n"
        f"Include key insights, spending patterns, and at least three actionable recommendations for better financial health."
    )
    return call_gemini(prompt)


def AI_summary(expense_csv):
    prompt = (
        f"Write a short and helpful summary of this user's spending behaviour and suggest two ways to improve financial discipline:\n"
        f"{expense_csv}"
    )
    return call_gemini(prompt)


def AI_financial_news(headlines_list):  # checks website and returns message about financial crisis or instability. Up to date since website is constantly being updated
    text = "\n".join(headlines_list)
    prompt = (
        f"Based on these financial news headlines:\n{text}\n\n"
        f"Do you detect any signs of potential financial crisis, instability, or major market risks? Summarise in 100 words."
    )
    return call_gemini(prompt)

def category_sugg(description):
    """
    Uses Gemini AI to suggest a spending category based on a user's expense description.
    Categories include: Food & Drink, Transport, Housing, Utilities, Health, Entertainment, Shopping, Emergency/Unexpected, and Other.
    """
    prompt = (
        f"You are an intelligent expense categorisation assistant. "
        f"Classify the following expense description into one of these categories:\n\n"
        f"Categories:\n"
        f"- Food & Drink\n"
        f"- Transport\n"
        f"- Housing\n"
        f"- Utilities\n"
        f"- Health\n"
        f"- Entertainment\n"
        f"- Shopping\n"
        f"- Emergency/Unexpected\n"
        f"- Other\n\n"
        f"Expense Description: \"{description}\"\n\n"
        f"Just reply with exactly one category from the list. No explanation is needed."
    )

    try:
        return call_gemini(prompt).strip()
    except Exception as e:
        return "Other"


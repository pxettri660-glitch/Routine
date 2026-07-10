from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

try:
    driver = webdriver.Chrome(options=options)
    driver.get('http://localhost:3000')
    time.sleep(3)
    logs = driver.get_log('browser')
    for log in logs:
        print(log)
    driver.quit()
except Exception as e:
    print("Selenium error:", e)

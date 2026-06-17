import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options

@pytest.fixture(scope="session")
def driver():
    # In a real CI environment, these capabilities would point to the emulator and built APK
    options = UiAutomator2Options()
    options.platform_name = 'Android'
    options.automation_name = 'UiAutomator2'
    options.device_name = 'Android Emulator'
    options.app = 'InterviuAI.apk'
    options.auto_grant_permissions = True

    try:
        driver = webdriver.Remote('http://127.0.0.1:4723', options=options)
        driver.implicitly_wait(10)
        yield driver
        driver.quit()
    except Exception as e:
        print(f"Failed to connect to Appium: {e}")
        yield None

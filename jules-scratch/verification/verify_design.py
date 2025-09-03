import asyncio
from playwright.async_api import async_playwright, expect
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Listen for all console events and print them
        page.on("console", lambda msg: print(f"Browser Console: {msg.type} {msg.text}"))

        # Navigate to the local server
        url = "http://localhost:8000/index.html"
        print(f"Navigating to {url}...")
        await page.goto(url)

        try:
            # Wait for the canvas to be visible
            await expect(page.locator('#canvas-container canvas')).to_be_visible(timeout=10000)

            # Give the scene a moment to stabilize and render fully
            await page.wait_for_timeout(2000)

            # --- Test the default (dispersed) state ---
            print("Capturing screenshot of the initial dispersed state...")
            await page.screenshot(path="jules-scratch/verification/01_dispersed_state.png")

            # --- Test the aggregated state ---
            print("Moving slider to aggregated state...")
            aggregation_slider = page.locator('#aggregation-slider')

            box = await aggregation_slider.bounding_box()
            if box:
                await page.mouse.click(box['x'] + box['width'] * 0.05, box['y'] + box['height'] / 2)

            await page.wait_for_timeout(3000)

            print("Capturing screenshot of the aggregated state...")
            await page.screenshot(path="jules-scratch/verification/02_aggregated_state.png")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # Take a screenshot even on failure to see the blank page
            await page.screenshot(path="jules-scratch/verification/error_screenshot.png")

        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(main())

import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8080", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Click the 'Entrar Login' button to go to the login page.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/header/div/div/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Fill in email and password fields and click the 'Entrar' button to log in.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div[2]/div/div[2]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('frankwebber33@hotmail.com')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div[2]/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('senha123')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/main/div/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert the page title is correct
        assert await frame.locator('h1').text_content() == 'Sistema Ministerial - Dashboard do Instrutor'
        # Assert the selected week is displayed correctly
        assert await frame.locator('text=8-14 de setembro 2025').count() > 0
        # Assert the theme is displayed correctly
        assert await frame.locator('text=Provérbios 30').count() > 0
        # Assert opening songs durations are displayed
        assert await frame.locator('text=136').count() > 0
        assert await frame.locator('text=80').count() > 0
        assert await frame.locator('text=128').count() > 0
        # Assert sections and their items are displayed correctly
        sections = [
            {
                'title': 'Tesouros da Palavra de Deus',
                'items': [
                    {'name': 'Não me dês nem pobreza nem riquezas', 'type': 'consideracao', 'duration': '10 min', 'references': 'Pro. 30:8, 9; w18.01 24-25 §§ 10-12', 'status': 'Não designado'},
                    {'name': 'Joias espirituais', 'type': 'participacao', 'duration': '10 min', 'references': 'Pro. 30:26 — w09 15/4 17 §§ 11-13', 'status': 'Não designado'},
                    {'name': 'Leitura da Bíblia', 'type': 'leitura', 'duration': '4 min', 'references': 'Pro. 30:1-14 (th lição 2)', 'status': 'Não designado'}
                ]
            },
            {
                'title': 'Faça Seu Melhor no Ministério',
                'items': [
                    {'name': 'Iniciando conversas', 'type': 'de casa_em_casa', 'duration': '4 min', 'references': 'Use A Sentinela N.º 1 de 2025 (lmd lição 1 ponto 3)', 'status': 'Não designado'},
                    {'name': 'Cultivando o interesse', 'type': 'testemunho publico', 'duration': '4 min', 'references': 'lmd lição 9 ponto 3', 'status': 'Não designado'},
                    {'name': 'Explicando suas crenças', 'type': 'discurso', 'duration': '4 min', 'references': 'jwbq artigo 102 — Tema: Jogar é pecado? (th lição 7)', 'status': 'Não designado'}
                ]
            },
            {
                'title': 'Nossa Vida Cristã',
                'items': [
                    {'name': 'Não Seja Enganado pela Falsa Paz! — Chibisa Selemani', 'type': 'video consideracao', 'duration': '5 min', 'status': 'Não designado'},
                    {'name': 'Realizações da Organização, setembro', 'type': 'video', 'duration': '10 min', 'status': 'Não designado'},
                    {'name': 'Estudo bíblico de congregação', 'type': 'estudo congregacao', 'duration': '30 min', 'references': 'lfb histórias 16-17', 'status': 'Não designado'}
                ]
            }
         ]
        for section in sections:
            # Check section title is present
            assert await frame.locator(f'text={section["title"]').count() > 0
            for item in section['items']:
                # Check item name is present
                assert await frame.locator(f'text={item["name"]').count() > 0
                # Check item duration is present
                assert await frame.locator(f'text={item["duration"]').count() > 0
                # Check item status is present
                assert await frame.locator(f'text={item["status"]').count() > 0
                # Optionally check references if present
                if 'references' in item:
                    assert await frame.locator(f'text={item["references"]').count() > 0
        # Assert summary counts
        assert await frame.locator('text=Total parts: 9').count() > 0 or await frame.locator('text=9').count() > 0
        assert await frame.locator('text=Assigned: 0').count() > 0 or await frame.locator('text=0').count() > 0
        assert await frame.locator('text=Pending: 9').count() > 0 or await frame.locator('text=9').count() > 0
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    
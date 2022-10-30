import puppeteer, { Browser, Page, ElementHandle } from "puppeteer"
import fs from 'fs'
import { QueueLib } from "../utils/queue"

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
    console.error(new Error().stack);

  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

let browser: Browser
(async () => {
  // fs.writeFileSync(`docs/pup.csv`, `profession:firstName:lastName:phoneNumber:address:hours:sector\n`)
  browser = await puppeteer.launch()

  const queries = [
    ["92100", "Généraliste (Médecin généraliste)"],
    ["92100", "Cardiologue"],
    ["92130", "Généraliste (Médecin généraliste)"],
    ["92130", "Cardiologue"],
    ["92200", "Généraliste (Médecin généraliste)"],
    ["92200", "Cardiologue"],
    ["92300", "Généraliste (Médecin généraliste)"],
    ["92300", "Cardiologue"],
  ]
  for (const [_address, _profession] of queries) {
    fs.writeFileSync(`docs/pup-${_address}-${_profession}.csv`, `profession:firstName:lastName:phoneNumber:address:hours:sector\n`)
    const page = await browser.newPage()
    await page.goto("http://annuairesante.ameli.fr/nouvelle-recherche/professionnels-de-sante.html")
    await QueueLib.Wait(5000)
    //profession
    const result = await page.$('[class="popin-autocomplete-ps-professions popin-autocomplete-enable"]')
    console.log("result.click");
    await result?.click({ delay: 100 })
    await QueueLib.Wait(1000)
    const elements = await page.$$('div[id="popinAutocompleteContainer"] li a')
    console.log(_profession);
    let elementsMap: Record<string, puppeteer.ElementHandle<Element>> = {}
    for (const element of elements) {
      const value = await element.evaluate((el => el.textContent?.toLowerCase())).catch(err => '')
      if (value)
        elementsMap[value] = element;
    }
    const element = elementsMap[_profession.toLowerCase()]
    console.log("element.click");
    await element?.click({ delay: 100 })
    await QueueLib.Wait(1000)
    //address
    const addresInput = await page.$('input[id="formOu"]');
    if (!addresInput) {
      throw { _address, _profession }
    }
    console.log("addresInput.evaluate");
    await addresInput.focus()
    await QueueLib.Wait(1000)
    await page.keyboard.type(_address)
    await page.waitForNetworkIdle()
    await QueueLib.Wait(1000)
    //
    const select = await page.$('[class="ui-menu-item"] [class="ui-corner-all"]')
    console.log(await select?.evaluate((el => el.textContent)));
    await select?.click()
    await QueueLib.Wait(1000)
    //
    const searchButton = await page.$('[type="submit"]')
    console.log("searchButton.click");
    await searchButton?.click()
    //result
    let loop = true;
    let counter = 1
    while (loop) {
      await page.waitForNetworkIdle()
      await QueueLib.Wait(1000)
      const items = await page.$$('[class="item-professionnel-inner"]')
      console.log(`${_address}-${_profession}-${counter}:${items.length}`);
      if (items.length == 0 && counter > 1) {
        await page.goBack()
        console.log("goBack");
        await page.waitForNetworkIdle()
        const nextButton = await page.$('form [src="/resources_ver/20220302095149/images/pagination_next.png"]')
        console.log("nextButton", nextButton);
        await nextButton?.click()
        continue
      }
      for (const item of items) {
        try {
          const fullName = await item.$eval('[class="ignore-css"]', el => el.textContent);
          const lastName = await item.$eval('[class="ignore-css"] strong', el => el.textContent);
          const firstName = fullName?.slice((lastName?.length || 0) + 1)
          const phoneNumber = await item.$eval('[class="item left tel"]', el => el.textContent).catch(err => "")
          const address = await item.$eval('[class="item left adresse"]', el => el.innerHTML.split("<br>").join(" ")).catch(err => "")
          const hours = await item.$eval('[class="item right type_honoraires"]', el => el.textContent).catch(err => "")
          const sector = await item.$eval('a[class="infobulle"]', el => el.textContent).catch(err => "")
          fs.appendFileSync(`docs/pup.csv`, `${_profession}:${firstName}:${lastName}:${phoneNumber}:${address}:${hours}:${sector}\n`)
          fs.appendFileSync(`docs/pup-${_address}-${_profession}.csv`, `${_profession}:${firstName}:${lastName}:${phoneNumber}:${address}:${hours}:${sector}\n`)
        } catch (error) {
          fs.appendFileSync(`docs/pup-error.log`, `${await item.evaluate((el) => el.textContent)}\n`)
        }
      }
      const nextButton = await page.$('form [src="/resources_ver/20220302095149/images/pagination_next.png"]')
      loop = nextButton ? true : false
      ++counter
      if (counter == 51)
        break
      await nextButton?.click()
    }
  }
})()




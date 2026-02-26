import https from 'https';

export async function getBcvRate() {
  try {
    const url = "https://www.bcv.org.ve";
    
    console.log("Fetching BCV rate...");

    // Function to fetch HTML using https module to ignore SSL errors (verify=False equivalent)
    const fetchHtml = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'www.bcv.org.ve',
          port: 443,
          path: '/',
          method: 'GET',
          rejectUnauthorized: false, // This is the equivalent of verify=False
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 10000
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve(data));
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error("Timeout fetching BCV"));
        });
        req.end();
      });
    };

    let html = "";
    try {
      html = await fetchHtml();
      console.log("BCV HTML length:", html.length);
    } catch (e: any) {
      console.error("Direct BCV fetch failed:", e.message);
    }

    if (html) {
      // Pattern 1: Specific class from user's script
      const rateMatch = html.match(/<div[^>]*class=['"]col-sm-6 col-xs-6 centrado['"][^>]*>[\s\S]*?<strong>\s*([\d,.]+)\s*<\/strong>/);
      if (rateMatch && rateMatch[1]) {
        console.log("BCV Rate found with Pattern 1:", rateMatch[1]);
        return rateMatch[1].trim().replace(',', '.');
      }

      // Pattern 2: Search for "USD" label followed by a value in a strong tag
      const usdMatch = html.match(/id=['"]dolar['"][\s\S]*?<strong>\s*([\d,.]+)\s*<\/strong>/);
      if (usdMatch && usdMatch[1]) {
        console.log("BCV Rate found with Pattern 2 (USD ID):", usdMatch[1]);
        return usdMatch[1].trim().replace(',', '.');
      }

      // Pattern 3: Any strong tag containing something that looks like a BS rate (often > 20)
      const strongRegex = /<strong>\s*([\d,.]+)\s*<\/strong>/g;
      let match;
      while ((match = strongRegex.exec(html)) !== null) {
        const val = match[1].replace(',', '.');
        if (parseFloat(val) > 20) {
          console.log("BCV Rate found with Pattern 3 (Generic strong):", val);
          return val;
        }
      }
    }

    console.log("BCV direct scraping failed or no HTML. Attempting fallback API...");
    
    // Fallback: Using an unofficial but stable BCV API if the main site fails
    try {
      const fallbackResponse = await fetch("https://ve.dolarapi.com/v1/dolares/bcv", { next: { revalidate: 3600 } });
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        if (data.promedio) {
          console.log("BCV Rate found via Fallback API:", data.promedio);
          return data.promedio.toString();
        }
      }
    } catch (e) {
      console.error("Fallback API call failed:", e);
    }

    throw new Error("Could not find rate in BCV HTML or Fallback API");
  } catch (error) {
    console.error("Error in getBcvRate:", error);
    return null;
  }
}

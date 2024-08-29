import axios from 'axios';
import xml2js from 'xml2js';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

async function fetchSitemapUrls(sitemapUrl) {
  try {
    const response = await axios.get(sitemapUrl);
    const sitemapXml = response.data;

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemapXml);

    const urls = result.urlset?.url?.map((urlObject) => urlObject.loc[0]);
    return urls || [];
  } catch (error) {
    console.error(`Failed to fetch sitemap: ${sitemapUrl} - ${error.message}`);
    return [];
  }
}

async function fetchSitemapIndex(sitemapIndexUrl) {
  try {
    const response = await axios.get(sitemapIndexUrl);
    const sitemapIndexXml = response.data;

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemapIndexXml);

    const sitemapUrls = result.sitemapindex?.sitemap?.map(
      (sitemapObject) => sitemapObject.loc[0]
    );

    return sitemapUrls || [];
  } catch (error) {
    console.error(`Failed to fetch sitemap index: ${sitemapIndexUrl} - ${error.message}`);
    return [];
  }
}

async function main() {
  try {
    const sitemapIndexUrl = 'add your sitemap url here';
    const sitemapUrls = await fetchSitemapIndex(sitemapIndexUrl);

    let allUrls = [];
    for (const sitemapUrl of sitemapUrls) {
      const urls = await fetchSitemapUrls(sitemapUrl);
      allUrls = allUrls.concat(urls);
    }

    if (allUrls.length === 0) {
      console.error('No URLs found in the sitemaps.');
      return;
    }

    const csvWriter = createCsvWriter({
      path: 'sitemap_urls.csv',
      header: [{ id: 'url', title: 'URL' }],
    });

    const records = allUrls.map((url) => ({ url }));
    await csvWriter.writeRecords(records);

    console.log('URLs have been written to sitemap_urls.csv');
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

main();

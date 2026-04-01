module.exports = {
  outputPath: '../deals/deals.json',
  // Timeout per fetch in milliseconds
  fetchTimeout: 10000,
  // Max retries per site on network failure
  maxRetries: 2,
  sites: [
    {
      id: 'mcdonalds',
      name: "McDonald's",
      url: 'https://www.mcdonalds.com/us/en-us/deals.html',
      parser: './parsers/mcdonalds.js',
    },
    // Add more restaurants here:
    // {
    //   id: 'burger-king',
    //   name: 'Burger King',
    //   url: 'https://www.bk.com/offers',
    //   parser: './parsers/burger-king.js',
    // },
  ],
};

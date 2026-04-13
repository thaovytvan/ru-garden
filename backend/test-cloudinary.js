const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary(name) {
  try {
    cloudinary.config({
      cloud_name: name,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log(`Testing Cloudinary connection with Cloud Name: ${name}`);
    const result = await cloudinary.api.ping();
    console.log(`Connection for ${name} successful:`, result);
    return true;
  } catch (error) {
    console.log(`Connection for ${name} failed:`, error.message || error);
    return false;
  }
}

async function run() {
  await testCloudinary('ru-garden');
  await testCloudinary('rugarden');
  await testCloudinary('ru_garden');
  await testCloudinary('nguyenvy');
}

run();

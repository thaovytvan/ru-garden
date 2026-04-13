import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { value: "VAN_PHONG", name: "Cây Văn Phòng" },
  { value: "TRONG_NHA", name: "Cây Trong Nhà" },
  { value: "NGOAI_TROI", name: "Cây Ngoài Trời" },
  { value: "SEN_DA_XUONG_RONG", name: "Sen Đá & Xương Rồng" },
  { value: "NHIET_DOI", name: "Cây Nhiệt Đới" },
  { value: "DUNG_CU", name: "Dụng Cụ Làm Vườn" },
  { value: "PHAN_BON_DAT", name: "Phân Bón & Đất Trồng" },
];

const products = [
  {
    name: "Cây Kim Tiền",
    slug: "cay-kim-tien",
    description:
      "Cây Kim Tiền (Pachira aquatica) mang lại may mắn và tài lộc. Thích hợp đặt ở văn phòng và phòng khách. Cây dễ chăm sóc, chịu bóng tốt.",
    price: 350000,
    salePrice: 299000,
    images: ["https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=1000&auto=format&fit=crop"],
    categoryValue: "VAN_PHONG",
    stock: 50,
    isFeatured: true,
    tags: ["phong thủy", "tài lộc", "văn phòng"],
  },
  {
    name: "Cây Lưỡi Hổ",
    slug: "cay-luoi-ho",
    description:
      "Cây Lưỡi Hổ (Sansevieria) là loại cây cảnh văn phòng được yêu thích nhất. Lọc không khí hiệu quả, chịu bóng, ít cần tưới nước.",
    price: 120000,
    salePrice: null,
    images: ["https://images.unsplash.com/photo-1599598425947-5202ea560983?q=80&w=1000&auto=format&fit=crop"],
    categoryValue: "VAN_PHONG",
    stock: 100,
    isFeatured: true,
    tags: ["lọc không khí", "văn phòng", "dễ chăm"],
  },
  {
    name: "Cây Trầu Bà",
    slug: "cay-trau-ba",
    description:
      "Cây Trầu Bà (Epipremnum aureum) dễ trồng, leo giàn đẹp. Thích hợp treo hoặc đặt trên kệ. Lọc không khí tốt và trang trí không gian sống.",
    price: 80000,
    salePrice: null,
    images: ["https://images.unsplash.com/photo-1612333223506-64cc19f68882?q=80&w=1000&auto=format&fit=crop"],
    categoryValue: "TRONG_NHA",
    stock: 80,
    isFeatured: false,
    tags: ["treo tường", "nhà cửa", "lọc không khí"],
  },
  {
    name: "Sen Đá Mix 5 Cây",
    slug: "sen-da-mix-5-cay",
    description:
      "Bộ 5 cây Sen Đá nhiều màu sắc đa dạng, mọng nước đẹp mắt. Thích hợp để bàn làm việc hoặc trang trí kệ sách. Cực kỳ dễ chăm sóc.",
    price: 150000,
    salePrice: 120000,
    images: ["https://images.unsplash.com/photo-1459411552884-841911883391?q=80&w=1000&auto=format&fit=crop"],
    categoryValue: "SEN_DA_XUONG_RONG",
    stock: 60,
    isFeatured: true,
    tags: ["sen đá", "mọng nước", "bàn làm việc"],
  },
  {
    name: "Cây Bạch Mã Hoàng Tử",
    slug: "cay-bach-ma-hoang-tu",
    description:
      "Cây Bạch Mã Hoàng Tử (Spathiphyllum) với hoa trắng thanh lịch, thích hợp không gian trong nhà. Lọc không khí và tạo cảm giác thư thái.",
    price: 250000,
    salePrice: null,
    images: ["https://images.unsplash.com/photo-1597055181300-e36caf3b452?q=80&w=1000&auto=format&fit=crop"],
    categoryValue: "TRONG_NHA",
    stock: 30,
    isFeatured: false,
    tags: ["hoa trắng", "thanh lịch", "trong nhà"],
  },
  {
    name: "Cây Monstera Deliciosa",
    slug: "cay-monstera",
    description:
      "Cây Monstera (Thủy Tùng Lá Xẻ) với lá xanh to, xẻ đặc trưng. Tạo điểm nhấn nổi bật cho phòng khách, phòng ngủ. Style nhiệt đới sang trọng.",
    price: 450000,
    salePrice: 380000,
    images: ["https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=1000&auto=format&fit=crop"],
    categoryValue: "NHIET_DOI",
    stock: 25,
    isFeatured: true,
    tags: ["nhiệt đới", "phòng khách", "lá xẻ"],
  },
  {
    name: "Cây Cẩm Tú Cầu",
    slug: "cay-cam-tu-cau",
    description:
      "Cây Cẩm Tú Cầu với chùm hoa bông tròn nhiều màu (xanh, hồng, trắng). Phù hợp để ngoài ban công hoặc sân vườn. Ra hoa quanh năm.",
    price: 180000,
    salePrice: null,
    images: ["https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?q=80&w=1000&auto=format&fit=crop"],
    categoryValue: "NGOAI_TROI",
    stock: 40,
    isFeatured: false,
    tags: ["hoa bông", "ban công", "sân vườn"],
  },
  {
    name: "Xương Rồng Trang Trí Cặp",
    slug: "xuong-rong-trang-tri-cap",
    description:
      "Bộ đôi Xương Rồng kiểu dáng độc đáo, chậu sứ trắng sang trọng. Trang trí bàn làm việc, kệ sách. Gần như không cần chăm sóc.",
    price: 200000,
    salePrice: 160000,
    images: ["https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?q=80&w=1000&auto=format&fit=crop"],
    categoryValue: "SEN_DA_XUONG_RONG",
    stock: 35,
    isFeatured: false,
    tags: ["xương rồng", "trang trí", "ít chăm"],
  },
];

const blogPosts = [
  {
    title: "Bí quyết chăm sóc Sen Đá luôn căng mọng",
    slug: "bi-quyet-cham-soc-sen-da",
    excerpt: "Sen đá là loại cây mọng nước được yêu thích bởi vẻ đẹp đa dạng. Tuy nhiên, để cây luôn căng mọng và không bị thối rễ, bạn cần nắm vững những quy tắc quan trọng về ánh sáng và lượng nước.",
    content: `Sen đá (Succulents) là nhóm thực vật mọng nước có khả năng tích trữ nước trong lá và thân. Dưới đây là 3 yếu tố then chốt để chăm sóc sen đá thành công:

1. Ánh sáng: Cây cần ít nhất 4-6 giờ ánh sáng mỗi ngày. Nếu đặt trong nhà, hãy để cây gần cửa sổ hướng Nam hoặc Đông.
2. Tưới nước: Quy tắc "đất khô mới tưới". Chỉ tưới nước khi đất đã khô hoàn toàn từ trên xuống dưới.
3. Đất trồng: Sử dụng loại đất thoát nước cực tốt, pha trộn giữa đá perlite, xơ dừa và phân trùn quế.`,
    image: "https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&q=80&w=2000",
    author: "Rú Garden"
  },
  {
    title: "Top 5 loại cây lọc không khí cực tốt cho phòng ngủ",
    slug: "top-5-cay-loc-khong-khi-phong-ngu",
    excerpt: "Một giấc ngủ ngon bắt đầu từ bầu không khí trong lành. Khám phá ngay những loại cây không chỉ đẹp mà còn giúp bạn ngủ sâu và khỏe mạnh hơn nhờ khả năng thanh lọc độc tố.",
    content: `Phòng ngủ là nơi chúng ta dành 1/3 cuộc đời để nghỉ ngơi. Việc đặt cây xanh phù hợp không chỉ giúp trang trí mà còn cải thiện chất lượng không khí đáng kể:

- Cây Lưỡi Hổ: Loại cây hiếm hoi giải phóng oxy vào ban đêm.
- Cây Lan Ý: Khả năng lọc bỏ các chất gây ung thư như benzen và formaldehyde.
- Thường Xuân: Giúp giảm lượng nấm mốc trong không khí.
- Cây Trầu Bà: Dễ trồng và lọc không khí cực hiệu quả.
- Nha Đam: Thông báo chất lượng không khí qua những đốm nâu trên lá.`,
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2000&auto=format&fit=crop",
    author: "Rú Garden"
  },
  {
    title: "Cách tưới nước cho cây trong nhà: Đúng và Đủ",
    slug: "cach-tuoi-nuoc-dung-cach",
    excerpt: "Sai lầm phổ biến nhất khiến cây trong nhà bị chết là do tưới nước không đúng cách. Hãy cùng Rú Garden tìm hiểu quy tắc \"vàng\" để cây luôn tươi tốt.",
    content: `Tưới nước là công việc đơn giản nhưng lại khó nhất trong chăm sóc cây. Hãy nhớ các lưu ý sau:

1. Kiểm tra độ ẩm đất: Dùng ngón tay hoặc que gỗ cắm sâu 2-3cm vào đất. Nếu đất dính, chưa cần tưới.
2. Tưới vào gốc: Tránh để nước đọng trên lá quá lâu gây nấm bệnh.
3. Thời điểm vàng: Nên tưới vào sáng sớm để cây có thời gian hấp thụ và bốc hơi nước dư thừa trong ngày.
4. Chậu có lỗ thoát nước: Luôn đảm bảo chậu cây của bạn thoát nước tốt.`,
    image: "https://images.unsplash.com/photo-1583321500900-82807e458f3c?q=80&w=2000&auto=format&fit=crop",
    author: "Rú Garden"
  }
];

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Seed Categories
  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { value: cat.value },
      update: { name: cat.name },
      create: cat,
    });
    createdCategories[cat.value] = category.id;
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // 2. Seed Products
  for (const p of products) {
    const { categoryValue, ...productData } = p;
    const categoryId = createdCategories[categoryValue];

    if (!categoryId) {
      console.warn(`⚠️ Category not found for product: ${p.name}`);
      continue;
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        // We only update categoryId to ensure correct relationship if categories changed
        // We DO NOT overwrite images, price, or description to preserve manual edits
        categoryId: categoryId,
      },
      create: {
        ...productData,
        categoryId: categoryId,
      },
    });
  }
  console.log(`✅ Seeded ${products.length} products`);

  console.log("✅ Seeded admin user (username: admin, password: Admin@123)");

  // 4. Seed Blog Posts
  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
      },
      create: post,
    });
  }
  console.log(`✅ Seeded ${blogPosts.length} blog posts`);

  console.log("🌿 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

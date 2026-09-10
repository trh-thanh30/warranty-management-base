import type {
  WebsiteEditableText,
  WebsiteHomepageContentByLocale,
  WebsiteTextStyle,
} from "../types/website-homepage.types.ts";

const editable = (
  content: string,
  style: Partial<WebsiteTextStyle> = {},
): WebsiteEditableText => ({
  align: "left",
  bold: false,
  color: "default",
  content,
  font: "body",
  italic: false,
  size: "m",
  ...style,
});

const eyebrow = (content: string) =>
  editable(content, { bold: true, color: "primary", size: "s" });
const heading = (content: string) =>
  editable(content, { bold: true, font: "heading", size: "2xl" });
const highlight = (content: string) =>
  editable(content, {
    bold: true,
    color: "primary",
    font: "heading",
    size: "2xl",
  });
const body = (content: string) => editable(content, { color: "muted" });
const action = (content: string) =>
  editable(content, { bold: true, size: "s" });
const label = (content: string) =>
  editable(content, { bold: true, color: "muted", size: "s" });

export const DEFAULT_WEBSITE_HOMEPAGE_CONTENT = {
  vi: {
    landing: {
      hero: {
        eyebrow: eyebrow("Hệ Sinh Thái Công Nghệ Ô Tô"),
        titlePrefix: heading("Giải pháp bảo vệ &"),
        titleHighlight: highlight("Hệ sinh thái"),
        titleSuffix: heading("phụ kiện ô tô cao cấp"),
        description: body(
          "Fujitek không chỉ cung cấp các dòng phim cách nhiệt cao cấp công nghệ Nhật Bản, mà còn mang đến giải pháp toàn diện cho xe ô tô với hệ thống Đèn tăng sáng LED Fujitek, Camera hành trình Lexzenz 4K và Cảm biến áp suất lốp TPMS thông minh.",
        ),
        primaryCta: action("Liên hệ tư vấn"),
        dealerCta: action("Mạng lưới đại lý"),
        uvPercent: 98,
        originPercent: 99,
        warrantyYears: 10,
        uvLabel: label("Cản tia UV & Hồng ngoại"),
        originLabel: label("Xuất xứ Nhật Bản"),
        warrantyLabel: label("Bảo hành chính hãng"),
        yearsSuffix: label(" năm"),
      },
      brandHeritage: {
        brandLabel: eyebrow("FUJITEK VIỆT NAM"),
        headlineLine1: heading("Định nghĩa"),
        headlineLine2Prefix: heading("lại"),
        headlineHighlight: highlight("chuẩn mực"),
        headlineLine3: heading("phim cách nhiệt"),
        descriptionPrimary: body(
          "Fujitek mang đến dòng phim cách nhiệt thế hệ mới với sứ mệnh mang đến tiêu chuẩn khác biệt: không chỉ chống nóng, mà còn nâng tầm trải nghiệm không gian khi di chuyển trong môi trường đô thị hiện đại.",
        ),
        descriptionSecondary: body(
          "Được phát triển và sản xuất tại Nhật Bản, Fujitek là sự kết tinh giữa hiệu năng kỹ thuật vượt trội, tư duy thẩm mỹ cao cấp và trách nhiệm bền vững.",
        ),
        originEyebrow: eyebrow("Xuất xứ công nghệ"),
        originTitle: heading("Xuất xứ công nghệ – Nền tảng của sự tin cậy"),
        originDescriptionPrimary: body(
          "“Made in Japan” không chỉ là xuất xứ, mà là lời cam kết về chất lượng. Fujitek được nghiên cứu, sản xuất và kiểm soát theo các tiêu chuẩn nghiêm ngặt của ngành vật liệu kỹ thuật cao.",
        ),
        originDescriptionSecondary: body(
          "Tại Việt Nam, Fujitek được giới thiệu như một giải pháp lâu dài, hướng đến phân khúc khách hàng đề cao giá trị sử dụng thực tế, độ bền công nghệ và trải nghiệm cao cấp.",
        ),
      },
      coreTech: {
        eyebrow: eyebrow("Công nghệ cốt lõi"),
        title: heading("Hai nền tảng công nghệ dẫn đầu"),
        description: body(
          "Khám phá sức mạnh của công nghệ Phún xạ kim loại và Nano Ceramic tiên tiến.",
        ),
      },
      milestones: {
        eyebrow: eyebrow("Hành trình phát triển"),
        title: heading("Cột mốc quan trọng"),
        description: body(
          "Hành trình hơn 10 năm đồng hành cùng hàng triệu chủ xe Việt Nam",
        ),
      },
      pillars: {
        eyebrow: eyebrow("Tầm nhìn & Giá trị cốt lõi"),
        title: heading("Sứ mệnh của chúng tôi"),
      },
      network: {
        eyebrow: eyebrow("Mạng lưới toàn quốc"),
        titlePrefix: heading("Hệ thống đại lý"),
        titleSuffix: highlight("phủ sóng 34 tỉnh thành"),
        description: body(
          "Với hơn 100 đại lý trên toàn quốc, Fujitek cam kết mang đến dịch vụ lắp đặt chuyên nghiệp và chế độ bảo hành E-Warranty minh bạch.",
        ),
        viewDealersCta: action("Tìm Đại lý gần nhất"),
      },
      testimonials: {
        eyebrow: eyebrow("Đánh giá từ đối tác"),
        title: heading("Khách hàng nói gì về chúng tôi"),
      },
      b2b: {
        eyebrow: eyebrow("Hợp tác phát triển"),
        title: heading("Trở thành Đại lý FUJITEK"),
        description: body(
          "Tham gia mạng lưới đại lý của chúng tôi để nhận được chính sách ưu đãi hấp dẫn, hỗ trợ đào tạo và marketing toàn diện.",
        ),
        partnerCta: action("Đăng ký làm Đại lý"),
      },
    },
    about: {
      eyebrow: "Giới thiệu",
      title: "Về FUJITEK – LEXZENZ Việt Nam",
      descriptionPrimary:
        "Với nhiều năm kinh nghiệm trong lĩnh vực nội thất ô tô, Fujitek Auto cung cấp các sản phẩm và dịch vụ nâng cấp xe chất lượng cao, từ thiết bị thông minh đến phim cách nhiệt và phụ kiện cao cấp.",
      descriptionSecondary:
        "FUJITEK Label Films hợp tác cùng các đối tác toàn cầu để mang đến giải pháp phim cách nhiệt công nghệ cao, bảo vệ toàn diện cho xe của bạn.",
      learnMore: "Xem thêm",
      hotlineLabel: "Hotline tư vấn",
      imageAlt: "FUJITEK – LEXZENZ Việt Nam",
    },
    products: {
      eyebrow: "Hệ sinh thái sản phẩm & Phụ kiện ô tô",
      title: "DANH MỤC SẢN PHẨM",
      description:
        "Giải pháp toàn diện về phim cách nhiệt, hệ thống chiếu sáng, camera hành trình và cảm biến áp suất lốp chính hãng từ Lexzenz & Fujitek.",
      explore: "Khám phá danh mục",
      viewAll: "Xem toàn bộ danh mục sản phẩm",
    },
    sputter: {
      eyebrow: "Công nghệ",
      title: "Phún xạ kim loại Sputtering",
      descriptionPrimary:
        "Phát triển theo FUJITEK Japanese Technology, quy trình sản xuất hiệu suất cao được kiểm nghiệm trong nhiều năm để đảm bảo độ ổn định và chất lượng film.",
      descriptionSecondary:
        "Công nghệ phún xạ kim loại Sputtering phủ các lớp kim loại cao cấp lên bề mặt film, hình thành lớp phản xạ nhiệt có khả năng phản xạ phần lớn bức xạ hồng ngoại trở lại môi trường bên ngoài, giúp giảm lượng nhiệt truyền vào xe.",
      learnMore: "Tìm hiểu công nghệ phim",
      chamberImageAlt:
        "Buồng phún xạ Sputtering theo công nghệ Nhật Bản FUJITEK",
      structureImageAlt: "Cấu trúc màng phim Sputtering",
      warrantyYears: 10,
      yearsSuffix: " năm",
      uvPercent: 99,
      irPercent: 98,
      warrantyLabel: "Bảo hành điện tử",
      uvLabel: "Chống tia UV",
      irLabel: "Cản tia hồng ngoại",
      details: {
        warranty: {
          title: "Bảo hành điện tử toàn quốc",
          description:
            "Sự an tâm của khách hàng luôn là ưu tiên hàng đầu. Bên cạnh công nghệ cách nhiệt tiên tiến, hệ thống bảo hành điện tử mang đến trải nghiệm quản lý thông tin dễ dàng, minh bạch và đảm bảo quyền lợi lâu dài trong suốt 10 năm sử dụng.",
        },
        uv: {
          title: "Chống tia UV tối ưu",
          description:
            "Khả năng cản tia UV lên đến 99.9% giúp tạo nên lớp bảo vệ vượt trội, hỗ trợ bảo vệ người dùng và hạn chế tác động của ánh nắng lên nội thất xe.",
        },
        ir: {
          title: "Cản tia hồng ngoại IR",
          description:
            "Công nghệ Ceramic Nano thế hệ mới tối ưu khả năng cản tia hồng ngoại mà không ảnh hưởng đến độ trong suốt của kính, mang lại sự thoải mái và riêng tư cho người sử dụng.",
        },
      },
    },
    comparison: {
      eyebrow: "Vì sao chọn",
      description:
        "FUJITEK mang đến giải pháp bảo vệ sức khỏe và nâng tầm trải nghiệm trong không gian xe.",
      bookNow: "Đặt lịch ngay",
      standardTitle: "Phim thông thường",
      standardItems: [
        "Cản nhiệt kém, nhanh bay màu sau một năm",
        "Gây chói mắt khi đi đêm hoặc trời mưa",
        "Kim loại có thể gây nhiễu GPS, E-pass và 4G",
      ],
      fujitekItems: [
        "Ngăn 99,9% tia UV và 98% tia hồng ngoại IR",
        "Công nghệ Sputter tối ưu, không gây nhiễu sóng",
        "Bảo hành điện tử chính hãng lên đến 15 năm",
      ],
    },
    faq: { eyebrow: "Hỏi đáp" },
  },
  en: {
    landing: {
      hero: {
        eyebrow: eyebrow("Automotive Technology Ecosystem"),
        titlePrefix: heading("Protection solutions &"),
        titleHighlight: highlight("an ecosystem"),
        titleSuffix: heading("of premium automotive accessories"),
        description: body(
          "Fujitek delivers comprehensive automotive solutions spanning Japanese window films, LED lighting, Lexzenz 4K dashcams, and intelligent TPMS sensors.",
        ),
        primaryCta: action("Contact us"),
        dealerCta: action("Dealer network"),
        uvPercent: 98,
        originPercent: 99,
        warrantyYears: 10,
        uvLabel: label("UV & infrared rejection"),
        originLabel: label("Japanese origin"),
        warrantyLabel: label("Official warranty"),
        yearsSuffix: label(" years"),
      },
      brandHeritage: {
        brandLabel: eyebrow("FUJITEK VIETNAM"),
        headlineLine1: heading("Redefining"),
        headlineLine2Prefix: heading("the"),
        headlineHighlight: highlight("standard"),
        headlineLine3: heading("of window film"),
        descriptionPrimary: body(
          "Fujitek introduces a new generation of window film that goes beyond heat rejection to elevate every journey.",
        ),
        descriptionSecondary: body(
          "Developed and manufactured in Japan, Fujitek combines advanced performance, premium aesthetics, and long-term responsibility.",
        ),
        originEyebrow: eyebrow("Technology origin"),
        originTitle: heading("Technology origin – The foundation of trust"),
        originDescriptionPrimary: body(
          "Made in Japan is more than an origin; it is a commitment to quality through rigorous research, production, and control.",
        ),
        originDescriptionSecondary: body(
          "In Vietnam, Fujitek is positioned as a lasting solution for customers who value real performance, durability, and a premium experience.",
        ),
      },
      coreTech: {
        eyebrow: eyebrow("Core technology"),
        title: heading("Two leading technology platforms"),
        description: body(
          "Discover the power of advanced metal sputtering and Nano Ceramic technologies.",
        ),
      },
      milestones: {
        eyebrow: eyebrow("Our journey"),
        title: heading("Key milestones"),
        description: body(
          "More than 10 years accompanying millions of drivers in Vietnam",
        ),
      },
      pillars: {
        eyebrow: eyebrow("Vision & Core values"),
        title: heading("Our mission"),
      },
      network: {
        eyebrow: eyebrow("Nationwide network"),
        titlePrefix: heading("Dealer system"),
        titleSuffix: highlight("across 34 provinces"),
        description: body(
          "With more than 100 dealers nationwide, Fujitek delivers professional installation and transparent E-Warranty service.",
        ),
        viewDealersCta: action("Find a nearby dealer"),
      },
      testimonials: {
        eyebrow: eyebrow("Partner reviews"),
        title: heading("What customers say about us"),
      },
      b2b: {
        eyebrow: eyebrow("Grow together"),
        title: heading("Become a FUJITEK dealer"),
        description: body(
          "Join our dealer network for attractive policies, professional training, and comprehensive marketing support.",
        ),
        partnerCta: action("Become a dealer"),
      },
    },
    about: {
      eyebrow: "About",
      title: "FUJITEK – LEXZENZ Vietnam",
      descriptionPrimary:
        "With years of automotive-interior experience, Panda Auto supplies high-quality vehicle upgrades ranging from smart devices to window film and premium accessories.",
      descriptionSecondary:
        "FUJITEK Label Films works with global partners to deliver advanced window-film solutions that protect your vehicle comprehensively.",
      learnMore: "Learn more",
      hotlineLabel: "Consultation hotline",
      imageAlt: "FUJITEK – LEXZENZ Vietnam",
    },
    products: {
      eyebrow: "Automotive Products & Accessories Ecosystem",
      title: "PRODUCT CATEGORIES",
      description:
        "Comprehensive automotive solutions including window films, LED lighting systems, 4K dashcams, and TPMS sensors from Lexzenz & Fujitek.",
      explore: "Explore category",
      viewAll: "View all product categories",
    },
    sputter: {
      eyebrow: "Technology",
      title: "Metal sputtering technology",
      descriptionPrimary:
        "Developed with FUJITEK Japanese Technology, the high-performance production process is validated through years of testing to ensure stable film quality.",
      descriptionSecondary:
        "Metal Sputtering technology coats premium metal layers onto the film surface, forming a heat-reflective layer that reflects most infrared radiation back outside and helps reduce heat transfer into the vehicle.",
      learnMore: "Explore the technology",
      chamberImageAlt: "FUJITEK Japanese technology sputtering chamber",
      structureImageAlt: "Sputtering window-film structure",
      warrantyYears: 10,
      yearsSuffix: " years",
      uvPercent: 99,
      irPercent: 98,
      warrantyLabel: "Electronic warranty",
      uvLabel: "UV blocking",
      irLabel: "Infrared rejection",
      details: {
        warranty: {
          title: "Nationwide electronic warranty",
          description:
            "Customer peace of mind is always the top priority. The E-Warranty system keeps warranty information easy to manage, transparent, and protected throughout 10 years of use.",
        },
        uv: {
          title: "Optimized UV protection",
          description:
            "UV rejection of up to 99.9% helps protect occupants and reduces sunlight impact on the vehicle interior.",
        },
        ir: {
          title: "Infrared heat rejection",
          description:
            "New-generation Ceramic Nano technology optimizes infrared rejection without affecting glass clarity, delivering a cooler and more private experience.",
        },
      },
    },
    comparison: {
      eyebrow: "Why choose",
      description:
        "FUJITEK delivers a solution that protects occupants and elevates the in-car experience.",
      bookNow: "Book now",
      standardTitle: "Conventional film",
      standardItems: [
        "Limited heat rejection and early color fading",
        "Distracting glare at night and in the rain",
        "Metal content may interfere with GPS, toll tags, and 4G",
      ],
      fujitekItems: [
        "Blocks 99.9% of UV and 98% of infrared radiation",
        "Optimized Sputter technology without signal interference",
        "Official electronic warranty for up to 15 years",
      ],
    },
    faq: { eyebrow: "Questions & answers" },
  },
} satisfies WebsiteHomepageContentByLocale;

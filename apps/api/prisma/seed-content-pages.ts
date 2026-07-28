import { PrismaPg } from '@prisma/adapter-pg';
import {
  content_page_kind,
  content_page_status,
  PrismaClient,
} from '@prisma/client';
import { Pool } from 'pg';

type PolicySection = {
  heading: string;
  items?: string[];
  paragraphs?: string[];
};

type ContentPageSeed = {
  kind: content_page_kind;
  sections: PolicySection[];
  slug: string;
  summary: string;
  title: string;
};

const contactItems = [
  'Hotline tư vấn và hỗ trợ: 0886 33 77 33.',
  'Khách hàng có thể gửi yêu cầu qua website, email hoặc fanpage chính thức của FUJITEK - LEXZENZ VIỆT NAM.',
];

// Nội dung được biên soạn theo chính sách công bố tại:
// https://lexzenz.com/chinh-sach/
const contentPageSeeds: ContentPageSeed[] = [
  {
    kind: content_page_kind.GENERAL_POLICY,
    slug: 'chinh-sach-quy-dinh-chung',
    title: 'Chính sách & quy định chung',
    summary:
      'Các nguyên tắc chung khi tìm hiểu, đặt mua và sử dụng sản phẩm LEXZENZ qua kênh phân phối chính thức.',
    sections: [
      {
        heading: '1. Phạm vi áp dụng',
        paragraphs: [
          'Chính sách áp dụng cho khách hàng và đối tác tìm hiểu, đặt mua hoặc sử dụng sản phẩm LEXZENZ qua website, gian hàng chính hãng và hệ thống đại lý.',
          'Điều kiện của từng sản phẩm, chương trình hoặc đơn hàng được áp dụng theo thông tin đã công bố và nội dung xác nhận tại thời điểm giao dịch.',
        ],
      },
      {
        heading: '2. Kênh phân phối chính thức',
        items: [
          'Gian hàng chính hãng được công bố trên các sàn thương mại điện tử.',
          'Đại lý thuộc hệ thống FUJITEK - LEXZENZ VIỆT NAM trên toàn quốc.',
          'Bộ phận bán hàng và các kênh liên hệ chính thức của thương hiệu.',
        ],
      },
      {
        heading: '3. Thông tin sản phẩm và giao dịch',
        items: [
          'Khách hàng cần đọc kỹ thông số, phiên bản và thời hạn bảo hành trước khi đặt mua.',
          'Giá bán, ưu đãi và quà tặng có thể khác nhau theo thời điểm hoặc từng nền tảng.',
          'Mỗi đơn hàng được xác nhận lại về sản phẩm, số lượng, giá và thời gian giao dự kiến.',
        ],
      },
      {
        heading: '4. Trách nhiệm của khách hàng',
        items: [
          'Cung cấp đúng thông tin liên hệ, địa chỉ nhận hàng và nội dung cần hỗ trợ.',
          'Kiểm tra sản phẩm, số lượng, giá và thông tin giao hàng trước khi xác nhận đơn.',
          'Mua và lắp đặt tại kênh chính thức để bảo đảm nguồn gốc và quyền lợi bảo hành.',
          'Sử dụng sản phẩm đúng điện áp, mục đích và hướng dẫn của nhà sản xuất.',
        ],
      },
      {
        heading: '5. Hiệu lực và cập nhật',
        paragraphs: [
          'Nội dung chính sách có thể được cập nhật theo hoạt động kinh doanh và quy định hiện hành. Phiên bản đang công bố trên website là căn cứ áp dụng.',
        ],
      },
      {
        heading: '6. Kênh hỗ trợ',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.PRIVACY_POLICY,
    slug: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật',
    summary:
      'Cách FUJITEK - LEXZENZ VIỆT NAM thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của khách hàng.',
    sections: [
      {
        heading: '1. Cam kết bảo mật',
        paragraphs: [
          'Thông tin cá nhân được tiếp nhận khi khách hàng truy cập website, mua hàng hoặc sử dụng dịch vụ. Dữ liệu chỉ được xử lý cho mục đích đã thông báo và trong phạm vi cần thiết.',
        ],
      },
      {
        heading: '2. Thông tin được thu thập',
        items: [
          'Họ và tên.',
          'Số điện thoại và địa chỉ email.',
          'Địa chỉ nhận hàng hoặc địa chỉ cần hỗ trợ.',
          'Thông tin đơn hàng và nội dung khách hàng chủ động cung cấp khi yêu cầu tư vấn, bảo hành hoặc xử lý sự cố.',
        ],
      },
      {
        heading: '3. Mục đích sử dụng dữ liệu',
        items: [
          'Tư vấn, tiếp nhận đơn hàng, xử lý thanh toán và tổ chức giao hàng.',
          'Cung cấp thông tin sản phẩm và hỗ trợ khách hàng trong quá trình sử dụng.',
          'Tiếp nhận bảo hành, phản hồi thắc mắc và giải quyết sự cố phát sinh.',
          'Gửi chương trình ưu đãi hoặc thông tin mới khi khách hàng đã đồng ý nhận.',
        ],
      },
      {
        heading: '4. Thời gian lưu trữ',
        paragraphs: [
          'Dữ liệu được lưu cho đến khi khách hàng yêu cầu xóa hoặc khi pháp luật có quy định khác. Trong thời gian lưu trữ, thông tin được bảo vệ bằng biện pháp quản lý và kỹ thuật phù hợp.',
        ],
      },
      {
        heading: '5. Phạm vi chia sẻ thông tin',
        items: [
          'Đơn vị vận chuyển cần thông tin để giao đơn hàng.',
          'Nhân viên bán hàng, chăm sóc khách hàng và nhà cung cấp liên quan cần dữ liệu để thực hiện dịch vụ.',
          'Cơ quan nhà nước có thẩm quyền khi có yêu cầu phù hợp với pháp luật.',
          'Bên kế thừa hợp pháp trong trường hợp sáp nhập, chuyển giao hoặc tái cấu trúc doanh nghiệp.',
        ],
      },
      {
        heading: '6. Bảo vệ thông tin',
        paragraphs: [
          'Dữ liệu được giới hạn theo đúng mục đích sử dụng. Các bên được tiếp cận thông tin phải tuân thủ trách nhiệm bảo mật tương ứng.',
          'Khách hàng có thể liên hệ để yêu cầu kiểm tra, điều chỉnh hoặc xóa thông tin trong phạm vi pháp luật cho phép.',
        ],
      },
      {
        heading: '7. Liên hệ về dữ liệu cá nhân',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.PURCHASE_POLICY,
    slug: 'chinh-sach-mua-hang',
    title: 'Chính sách mua hàng',
    summary:
      'Hướng dẫn mua sản phẩm LEXZENZ dành cho khách hàng bán lẻ và đối tác đại lý trên toàn quốc.',
    sections: [
      {
        heading: '1. Kênh mua hàng dành cho khách lẻ',
        items: [
          'Gian hàng LEXZENZ chính hãng trên Shopee.',
          'Gian hàng Smartonline.vn trên Shopee.',
          'Gian hàng Autotech trên Shopee.',
          'Đại lý được FUJITEK - LEXZENZ VIỆT NAM ủy quyền.',
        ],
      },
      {
        heading: '2. Quy trình đặt hàng trực tuyến',
        items: [
          'Chọn sản phẩm theo danh mục và nhu cầu sử dụng.',
          'Đọc kỹ thông số kỹ thuật, phiên bản và chính sách bảo hành.',
          'Thêm sản phẩm vào giỏ hàng, nhập thông tin giao nhận và chọn phương thức thanh toán.',
          'Theo dõi trạng thái đơn và kiểm tra sản phẩm trước khi xác nhận hoàn tất.',
        ],
      },
      {
        heading: '3. Lưu ý khi mua hàng',
        items: [
          'Ưu tiên gian hàng chính hãng hoặc đại lý được ủy quyền để bảo đảm quyền lợi.',
          'Kiểm tra đúng phiên bản và thông tin bảo hành trước khi đặt mua.',
          'Giá, ưu đãi và quà tặng có thể thay đổi theo thời điểm hoặc nền tảng.',
        ],
      },
      {
        heading: '4. Chính sách dành cho đại lý',
        paragraphs: [
          'FUJITEK - LEXZENZ VIỆT NAM tiếp nhận đăng ký hợp tác từ đối tác trên toàn quốc với quy trình làm việc và chính sách bán hàng được trao đổi minh bạch.',
          'Đối tác có thể đăng ký qua biểu mẫu trên website, hotline hoặc các kênh chính thức. Bộ phận kinh doanh sẽ liên hệ để tư vấn và xác nhận thông tin.',
        ],
      },
      {
        heading: '5. Đặt hàng dành cho đại lý',
        items: [
          'Đặt hàng qua nhân viên kinh doanh phụ trách khu vực hoặc hotline.',
          'Xác nhận sản phẩm, số lượng, giá bán và thời gian giao dự kiến cho từng đơn.',
        ],
      },
      {
        heading: '6. Hỗ trợ mua hàng và đăng ký đại lý',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.WARRANTY_RETURN_POLICY,
    slug: 'chinh-sach-bao-hanh-doi-tra',
    title: 'Chính sách bảo hành - Đổi trả',
    summary:
      'Thời hạn, điều kiện và quy trình đổi sản phẩm LEXZENZ bị lỗi kỹ thuật trong phạm vi bảo hành.',
    sections: [
      {
        heading: '1. Thời hạn và hình thức bảo hành',
        paragraphs: [
          'Sản phẩm LEXZENZ được bảo hành từ 2 đến 5 năm tùy dòng sản phẩm. Thời hạn được tính từ ngày kích hoạt bảo hành.',
          'Sản phẩm đủ điều kiện được áp dụng hình thức đổi 1 sản phẩm mới tương ứng cho 1 sản phẩm lỗi.',
        ],
      },
      {
        heading: '2. Phạm vi áp dụng',
        items: [
          'Sản phẩm LEXZENZ bị hư hỏng do lỗi kỹ thuật của sản phẩm.',
          'Sản phẩm chính hãng được lắp đặt tại đại lý thuộc hệ thống FUJITEK - LEXZENZ VIỆT NAM.',
          'Tem niêm phong chống tháo còn nguyên vẹn, không bị rách hoặc có dấu hiệu can thiệp.',
        ],
      },
      {
        heading: '3. Trường hợp từ chối bảo hành',
        items: [
          'Hư hỏng do dùng sai điện áp, sử dụng không đúng cách, tai nạn, thiên tai hoặc sự kiện ngoài khả năng kiểm soát.',
          'Sản phẩm thanh lý hoặc quà tặng kèm theo chương trình bán hàng.',
          'Sản phẩm đã được sửa chữa hoặc thay đổi kết cấu.',
          'Tem niêm phong bị rách, mất hoặc có dấu hiệu tháo mở.',
        ],
      },
      {
        heading: '4. Quy trình tiếp nhận và đổi sản phẩm',
        items: [
          'Khách hàng mang sản phẩm lỗi đến đại lý FUJITEK - LEXZENZ VIỆT NAM gần nhất.',
          'Đại lý lập yêu cầu, kiểm tra sơ bộ và gửi hình ảnh hoặc video tình trạng sản phẩm cho bộ phận chăm sóc khách hàng.',
          'Bộ phận chăm sóc khách hàng xác minh điều kiện và phản hồi kết quả.',
          'Khi yêu cầu hợp lệ, đại lý đổi sản phẩm mới cho khách hàng.',
        ],
      },
      {
        heading: '5. Thời gian xử lý',
        paragraphs: [
          'Bộ phận chăm sóc khách hàng dự kiến phản hồi trong 15 phút sau khi nhận đủ thông tin. Ngoài giờ làm việc, cuối tuần hoặc ngày lễ, thời gian có thể kéo dài hơn.',
          'Đại lý gửi sản phẩm lỗi về nhà cung cấp trong tối đa 7 ngày làm việc. Nhà cung cấp gửi sản phẩm thay thế trong tối đa 7 ngày làm việc kể từ khi nhận hàng lỗi.',
        ],
      },
      {
        heading: '6. Chi phí bảo hành',
        items: [
          'Khách hàng không phải trả thêm chi phí cho sản phẩm đổi trong phạm vi bảo hành.',
          'Nhà cung cấp chịu toàn bộ chi phí vận chuyển liên quan đến việc đổi sản phẩm giữa đại lý và nhà cung cấp.',
        ],
      },
      {
        heading: '7. Địa điểm bảo hành',
        paragraphs: [
          'Khách hàng có thể tiếp nhận bảo hành tại các đại lý FUJITEK - LEXZENZ VIỆT NAM trên toàn quốc.',
        ],
      },
      {
        heading: '8. Kênh hỗ trợ bảo hành',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.SHIPPING_POLICY,
    slug: 'chinh-sach-giao-hang',
    title: 'Chính sách giao hàng',
    summary:
      'Nguyên tắc giao nhận và kiểm tra đơn hàng mua qua kênh trực tuyến hoặc hệ thống đại lý.',
    sections: [
      {
        heading: '1. Thông tin giao hàng',
        paragraphs: [
          'Khách hàng cung cấp đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng khi đặt mua. Thông tin giao nhận được xác nhận cùng đơn hàng.',
        ],
      },
      {
        heading: '2. Theo dõi đơn hàng',
        items: [
          'Đơn trực tuyến được theo dõi theo trạng thái hiển thị trên nền tảng đặt hàng.',
          'Đơn qua đại lý được giao theo thời gian đã xác nhận giữa đại lý và khách hàng.',
        ],
      },
      {
        heading: '3. Thời gian và chi phí',
        paragraphs: [
          'Thời gian và phí giao hàng được hiển thị trên nền tảng hoặc xác nhận cho từng đơn. Các thông tin này có thể khác nhau theo địa chỉ và đơn vị vận chuyển.',
        ],
      },
      {
        heading: '4. Kiểm tra khi nhận hàng',
        items: [
          'Đối chiếu sản phẩm, phiên bản và số lượng với đơn đã đặt.',
          'Kiểm tra tình trạng bên ngoài của kiện hàng và sản phẩm trước khi xác nhận hoàn tất.',
          'Liên hệ ngay với nơi bán khi đơn hàng sai, thiếu hoặc có dấu hiệu hư hỏng.',
        ],
      },
      {
        heading: '5. Hỗ trợ giao nhận',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.PAYMENT_POLICY,
    slug: 'chinh-sach-thanh-toan',
    title: 'Chính sách thanh toán',
    summary:
      'Các phương thức thanh toán được chấp nhận và thông tin tài khoản chuyển khoản chính thức.',
    sections: [
      {
        heading: '1. Phương thức thanh toán',
        items: [
          'Thanh toán tiền mặt khi nhận hàng.',
          'Chuyển khoản ngân hàng theo thông tin tài khoản chính thức.',
        ],
      },
      {
        heading: '2. Thông tin chuyển khoản',
        items: [
          'Chủ tài khoản: CÔNG TY CỔ PHẦN VILATEK.',
          'Ngân hàng: Vietcombank, Chi nhánh Tân Định - Phòng giao dịch Nguyễn Trãi.',
          'Số tài khoản: 1039439999.',
        ],
      },
      {
        heading: '3. Nội dung chuyển khoản',
        items: [
          'Ghi số điện thoại dùng để mua hàng và mã đơn hàng.',
          'Kiểm tra đúng tên chủ tài khoản, ngân hàng, số tài khoản và số tiền trước khi xác nhận.',
        ],
      },
      {
        heading: '4. Xác nhận và hóa đơn',
        paragraphs: [
          'Đơn hàng được xác nhận thanh toán sau khi khoản chuyển được ghi nhận. Hóa đơn đầy đủ được cung cấp sau khi doanh nghiệp nhận được tiền.',
        ],
      },
      {
        heading: '5. Hỗ trợ thanh toán',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.FAQ,
    slug: 'cau-hoi-thuong-gap',
    title: 'Câu hỏi thường gặp',
    summary:
      'Thông tin về điều kiện, bảo hành, thi công và hỗ trợ được tổng hợp để khách hàng dễ dàng lựa chọn.',
    sections: [
      {
        heading: 'Phim cách nhiệt FUJITEK được bảo hành bao lâu?',
        paragraphs: [
          'FUJITEK áp dụng bảo hành điện tử chính hãng lên đến 15 năm cho các lỗi thuộc phạm vi chính sách.',
        ],
      },
      {
        heading: 'Tra cứu bảo hành điện tử như thế nào?',
        paragraphs: [
          'Nhập số điện thoại, biển số xe hoặc mã E-Warranty để kiểm tra thông tin và thời hạn bảo hành.',
        ],
      },
      {
        heading: 'Sputter khác Nano Ceramic thông thường như thế nào?',
        paragraphs: [
          'Công nghệ Sputter nâng cao hiệu suất cản nhiệt, duy trì độ trong quang học và được tối ưu để không ảnh hưởng tín hiệu.',
        ],
      },
      {
        heading: 'Thi công phim cách nhiệt mất bao lâu?',
        paragraphs: [
          'Thời gian thi công trọn gói thường từ 1,5 đến 2,5 giờ tùy loại xe và gói phim.',
        ],
      },
      {
        heading: 'Nên chọn gói phim nào cho xe của tôi?',
        paragraphs: [
          'Bạn nên chọn theo vị trí kính, nhu cầu cách nhiệt, độ riêng tư và thói quen lái xe. Kính lái thường ưu tiên độ trong, kính sườn và kính hậu có thể chọn mã tối hơn để tăng riêng tư.',
        ],
      },
      {
        heading: 'Sau khi dán phim cần lưu ý gì?',
        paragraphs: [
          'Trong vài ngày đầu, nên hạn chế hạ kính, không vệ sinh mạnh bề mặt film và để xe ở môi trường khô thoáng để lớp keo ổn định hoàn toàn.',
        ],
      },
      {
        heading: 'Phim có ảnh hưởng GPS, ETC hoặc sóng điện thoại không?',
        paragraphs: [
          'Các dòng phim FUJITEK được tư vấn theo từng vị trí kính để cân bằng hiệu suất cách nhiệt và khả năng tương thích tín hiệu. Nếu xe dùng nhiều thiết bị thu phát, kỹ thuật viên sẽ đề xuất mã phim phù hợp.',
        ],
      },
      {
        heading: 'Khi nào cần gửi yêu cầu bảo hành?',
        paragraphs: [
          'Bạn nên gửi yêu cầu khi film có dấu hiệu bong mép, phồng rộp, lỗi bề mặt hoặc thông tin E-Warranty cần được kiểm tra lại trên hệ thống.',
        ],
      },
    ],
  },
];

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderPolicyContent(sections: PolicySection[]): string {
  return sections
    .map((section) => {
      const paragraphs = (section.paragraphs ?? [])
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('');
      const items = section.items?.length
        ? `<ul>${section.items
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join('')}</ul>`
        : '';

      return `<h2>${escapeHtml(section.heading)}</h2>${paragraphs}${items}`;
    })
    .join('');
}

export async function seedContentPages(client: PrismaClient) {
  for (const page of contentPageSeeds) {
    const content =
      page.kind === content_page_kind.FAQ
        ? ''
        : renderPolicyContent(page.sections);

    await client.$transaction(async (tx) => {
      const seededPage = await tx.contentPage.upsert({
        where: { slug: page.slug },
        update: {
          content,
          kind: page.kind,
          published_at: new Date('2026-07-27T00:00:00.000Z'),
          status: content_page_status.PUBLISHED,
          summary: page.summary,
          title: page.title,
        },
        create: {
          content,
          kind: page.kind,
          published_at: new Date('2026-07-27T00:00:00.000Z'),
          slug: page.slug,
          status: content_page_status.PUBLISHED,
          summary: page.summary,
          title: page.title,
        },
      });

      await tx.contentPageFaqItem.deleteMany({
        where: { content_page_id: seededPage.id },
      });

      if (page.kind === content_page_kind.FAQ) {
        await tx.contentPageFaqItem.createMany({
          data: page.sections.map((section, index) => ({
            answer: renderFaqAnswer(section),
            content_page_id: seededPage.id,
            is_active: true,
            question: section.heading,
            sort_order: index,
          })),
        });
      }
    });
  }

  console.log(
    `Seeded ${contentPageSeeds.length} Vietnamese content pages (policies and FAQ).`,
  );
}

function renderFaqAnswer(section: PolicySection): string {
  const paragraphs = (section.paragraphs ?? [])
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
  const items = section.items?.length
    ? `<ul>${section.items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join('')}</ul>`
    : '';

  return `${paragraphs}${items}`;
}

let prisma: PrismaClient | undefined;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  await seedContentPages(prisma);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('Error seeding policy content pages:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma?.$disconnect();
    });
}

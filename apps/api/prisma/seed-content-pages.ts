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

type PolicySeed = {
  kind: content_page_kind;
  sections: PolicySection[];
  slug: string;
  summary: string;
  title: string;
};

const contactItems = [
  'Văn phòng TP. Hồ Chí Minh: 7C Nguyễn Ngọc Phương, Phường Thạnh Mỹ Tây, TP. Hồ Chí Minh. Hotline: 0886 33 77 33.',
  'Văn phòng Hà Nội: Số 62, Ngõ 20 Nghĩa Đô, Phường Nghĩa Đô, TP. Hà Nội. Hotline: 0989 017 999.',
  'Email: fujitek.lexzenz.vn@gmail.com. Khách hàng cũng có thể gửi yêu cầu qua website hoặc fanpage chính thức FUJITEK - LEXZENZ VIỆT NAM.',
];

const policySeeds: PolicySeed[] = [
  {
    kind: content_page_kind.GENERAL_POLICY,
    slug: 'chinh-sach-quy-dinh-chung',
    title: 'Chính sách & quy định chung',
    summary:
      'Quy định khi truy cập website, tìm hiểu, đặt mua và sử dụng sản phẩm, dịch vụ của FUJITEK - LEXZENZ VIỆT NAM.',
    sections: [
      {
        heading: '1. Phạm vi và đối tượng áp dụng',
        paragraphs: [
          'Chính sách áp dụng cho người truy cập website, khách mua hàng, người sử dụng sản phẩm và bên liên hệ FUJITEK - LEXZENZ VIỆT NAM qua các kênh chính thức.',
          'Các điều kiện riêng trên báo giá, đơn hàng, phiếu bàn giao, thông tin sản phẩm hoặc E-Warranty được ưu tiên áp dụng cho giao dịch và sản phẩm tương ứng.',
        ],
      },
      {
        heading: '2. Hệ thống sản phẩm và phân phối',
        paragraphs: [
          'FUJITEK - LEXZENZ VIỆT NAM cung cấp thiết bị điện tử và phụ kiện ô tô như camera hành trình, Android Box, cảm biến áp suất lốp, đèn tăng sáng và phụ kiện độ đèn.',
          'Sản phẩm được phân phối qua website, văn phòng và mạng lưới đại lý trên toàn quốc. Khách hàng nên kiểm tra đại lý và nguồn gốc sản phẩm trước khi giao dịch.',
        ],
      },
      {
        heading: '3. Thông tin trên website',
        items: [
          'Hình ảnh có tính minh họa; màu sắc, bao bì và phụ kiện có thể thay đổi theo lô sản xuất.',
          'Thông số, khả năng tương thích và chế độ bảo hành được xác định theo đúng model, phiên bản và tài liệu đi kèm.',
          'Giá bán, tồn kho và ưu đãi có thể thay đổi; thông tin được xác nhận cuối cùng trong đơn hàng hoặc báo giá.',
        ],
      },
      {
        heading: '4. Trách nhiệm của khách hàng',
        items: [
          'Cung cấp đúng họ tên, số điện thoại, địa chỉ nhận hàng, thông tin xe và sản phẩm cần hỗ trợ.',
          'Kiểm tra model, khả năng tương thích và nội dung đơn hàng trước khi xác nhận.',
          'Sử dụng, bảo quản và lắp đặt sản phẩm theo hướng dẫn; không tự ý can thiệp khi chưa có tư vấn kỹ thuật.',
          'Bảo mật tài khoản, mã xác thực và thông tin E-Warranty; thông báo ngay khi phát hiện sử dụng trái phép.',
        ],
      },
      {
        heading: '5. Quyền sở hữu trí tuệ',
        paragraphs: [
          'Tên thương mại, nhãn hiệu, nội dung, hình ảnh, video, tài liệu và thiết kế trên website thuộc FUJITEK - LEXZENZ VIỆT NAM hoặc bên cấp phép hợp pháp.',
          'Không được sao chép, chỉnh sửa, phân phối hoặc dùng cho mục đích thương mại khi chưa có chấp thuận bằng văn bản, trừ trường hợp pháp luật cho phép.',
        ],
      },
      {
        heading: '6. Giới hạn trách nhiệm',
        paragraphs: [
          'Website có thể gián đoạn do bảo trì, sự cố đường truyền hoặc nguyên nhân ngoài khả năng kiểm soát. Chúng tôi sẽ nỗ lực khôi phục và hỗ trợ trong thời gian hợp lý.',
          'Chúng tôi không chịu trách nhiệm cho giao dịch giả mạo, tài khoản nhận tiền không được xác nhận hoặc dịch vụ do bên không thuộc hệ thống chính thức tự cam kết.',
        ],
      },
      {
        heading: '7. Cập nhật chính sách',
        paragraphs: [
          'Chính sách có thể được điều chỉnh theo hoạt động kinh doanh, sản phẩm và quy định hiện hành. Phiên bản được công bố trên website áp dụng từ ngày cập nhật.',
        ],
      },
      {
        heading: '8. Kênh hỗ trợ chính thức',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.PRIVACY_POLICY,
    slug: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật',
    summary:
      'Thông tin về dữ liệu được thu thập, mục đích xử lý, thời gian lưu trữ, chia sẻ dữ liệu và quyền của khách hàng.',
    sections: [
      {
        heading: '1. Phạm vi chính sách',
        paragraphs: [
          'Chính sách áp dụng khi khách hàng truy cập website, gửi biểu mẫu, mua hàng, kích hoạt bảo hành, yêu cầu kỹ thuật hoặc liên hệ qua các kênh chính thức.',
          'Khi cung cấp dữ liệu của người khác, khách hàng cần bảo đảm đã có quyền cung cấp và thông tin là chính xác.',
        ],
      },
      {
        heading: '2. Dữ liệu có thể được thu thập',
        items: [
          'Họ tên, số điện thoại, email, địa chỉ và khu vực cần hỗ trợ.',
          'Thông tin đơn hàng, thanh toán, hóa đơn, giao nhận và lịch sử trao đổi.',
          'Thông tin xe, model, số serial, mã bảo hành, ngày mua, đại lý và hồ sơ yêu cầu bảo hành.',
          'Ảnh, video, tài liệu hoặc nội dung khách hàng chủ động gửi để chứng minh tình trạng sản phẩm.',
          'Dữ liệu kỹ thuật như địa chỉ IP, loại thiết bị, trình duyệt, thời điểm truy cập và cookie cần thiết.',
        ],
      },
      {
        heading: '3. Mục đích sử dụng dữ liệu',
        items: [
          'Tư vấn sản phẩm, kiểm tra khả năng tương thích và phản hồi yêu cầu của khách hàng.',
          'Xác nhận, xử lý, giao và đối soát đơn hàng; phát hành chứng từ khi có yêu cầu.',
          'Kích hoạt, tra cứu và quản lý E-Warranty; tiếp nhận bảo hành hoặc hỗ trợ kỹ thuật.',
          'Phòng chống gian lận, bảo vệ tài khoản và giải quyết khiếu nại.',
          'Phân tích vận hành, cải thiện website, chất lượng sản phẩm và trải nghiệm dịch vụ.',
          'Gửi thông tin chăm sóc hoặc ưu đãi khi khách hàng đồng ý và cho phép từ chối nhận.',
        ],
      },
      {
        heading: '4. Chia sẻ dữ liệu',
        paragraphs: [
          'Dữ liệu chỉ được chia sẻ trong phạm vi cần thiết với đại lý, đơn vị vận chuyển, thanh toán, lưu trữ, kỹ thuật hoặc nhà cung cấp hỗ trợ xử lý giao dịch.',
          'Thông tin có thể được cung cấp cho cơ quan có thẩm quyền khi có yêu cầu hợp pháp hoặc để bảo vệ quyền, tài sản và an toàn của khách hàng và doanh nghiệp.',
          'FUJITEK - LEXZENZ VIỆT NAM không bán hoặc trao đổi dữ liệu cá nhân để thu lợi trái với mục đích đã thông báo.',
        ],
      },
      {
        heading: '5. Lưu trữ và bảo vệ dữ liệu',
        paragraphs: [
          'Dữ liệu được lưu trong thời gian cần thiết để hoàn thành mục đích xử lý, thực hiện bảo hành, giải quyết tranh chấp và đáp ứng nghĩa vụ lưu trữ.',
          'Biện pháp quản trị và kỹ thuật hợp lý được áp dụng để hạn chế mất mát, truy cập, thay đổi hoặc tiết lộ trái phép.',
          'Không có hệ thống truyền hoặc lưu trữ nào an toàn tuyệt đối. Khi phát hiện rủi ro, chúng tôi sẽ đánh giá, xử lý và thông báo theo phạm vi cần thiết.',
        ],
      },
      {
        heading: '6. Cookie và dữ liệu truy cập',
        paragraphs: [
          'Website có thể dùng cookie cần thiết để duy trì phiên, ghi nhớ lựa chọn và bảo đảm chức năng. Cookie phân tích hoặc tiếp thị chỉ được dùng theo cấu hình và sự đồng ý áp dụng.',
          'Khách hàng có thể quản lý cookie trong trình duyệt. Việc tắt cookie cần thiết có thể làm một số chức năng hoạt động không đầy đủ.',
        ],
      },
      {
        heading: '7. Quyền và lựa chọn của khách hàng',
        items: [
          'Yêu cầu biết, kiểm tra hoặc nhận thông tin về dữ liệu đang được xử lý.',
          'Yêu cầu chỉnh sửa dữ liệu sai hoặc bổ sung dữ liệu còn thiếu.',
          'Yêu cầu rút lại sự đồng ý, hạn chế hoặc xóa dữ liệu trong phạm vi được áp dụng.',
          'Từ chối thông tin quảng bá và gửi phản ánh về việc xử lý dữ liệu.',
        ],
      },
      {
        heading: '8. Gửi yêu cầu về dữ liệu cá nhân',
        paragraphs: [
          'Yêu cầu cần nêu rõ thông tin nhận diện, nội dung cần xử lý và kênh phản hồi. Chúng tôi có thể xác minh danh tính trước khi thực hiện để bảo vệ khách hàng.',
        ],
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.PURCHASE_POLICY,
    slug: 'chinh-sach-mua-hang',
    title: 'Chính sách mua hàng',
    summary:
      'Quy trình chọn sản phẩm, xác nhận đơn hàng, kiểm tra tương thích, lắp đặt, nghiệm thu và kích hoạt bảo hành.',
    sections: [
      {
        heading: '1. Kênh mua hàng',
        items: [
          'Đặt hàng trên website hoặc qua thông tin liên hệ được công bố chính thức.',
          'Mua tại văn phòng, showroom hoặc đại lý thuộc hệ thống FUJITEK - LEXZENZ VIỆT NAM.',
          'Trao đổi qua fanpage chính thức; đơn hàng chỉ có hiệu lực sau khi sản phẩm, giá và nơi giao được xác nhận.',
        ],
      },
      {
        heading: '2. Thông tin cần cung cấp',
        items: [
          'Họ tên, số điện thoại, địa chỉ và phương thức nhận hàng.',
          'Tên sản phẩm, model, số lượng và phụ kiện hoặc dịch vụ lắp đặt đi kèm.',
          'Dòng xe, đời xe và cấu hình liên quan khi sản phẩm cần kiểm tra tương thích.',
          'Thông tin xuất hóa đơn hoặc yêu cầu đặc biệt, nếu có.',
        ],
      },
      {
        heading: '3. Quy trình xác nhận đơn hàng',
        items: [
          'Tiếp nhận nhu cầu và tư vấn sản phẩm phù hợp.',
          'Kiểm tra model, tồn kho, giá, ưu đãi, chi phí giao hoặc lắp đặt.',
          'Xác nhận tổng giá trị, phương thức thanh toán, địa chỉ và thời gian dự kiến.',
          'Chuẩn bị hàng sau khi khách hàng xác nhận và hoàn thành khoản đặt trước nếu giao dịch yêu cầu.',
        ],
      },
      {
        heading: '4. Giá bán và ưu đãi',
        paragraphs: [
          'Giá hiển thị có thể thay đổi theo thời điểm, phiên bản, gói phụ kiện và phạm vi lắp đặt. Báo giá hoặc đơn hàng được xác nhận là căn cứ của giao dịch.',
          'Mỗi chương trình ưu đãi có điều kiện và thời hạn riêng. Các ưu đãi không mặc nhiên được cộng dồn nếu nội dung chương trình không quy định.',
        ],
      },
      {
        heading: '5. Kiểm tra tương thích và lắp đặt',
        paragraphs: [
          'Khách hàng cần cung cấp đúng thông tin xe. Tư vấn tương thích dựa trên dữ liệu được cung cấp và có thể cần kiểm tra thực tế trước khi lắp.',
          'Sản phẩm cần kỹ thuật chuyên môn nên được lắp tại điểm được giới thiệu hoặc bởi kỹ thuật viên đủ năng lực để bảo đảm vận hành và quyền lợi bảo hành.',
        ],
      },
      {
        heading: '6. Kiểm tra và nghiệm thu',
        items: [
          'Đối chiếu tên hàng, model, số lượng, phụ kiện và tình trạng bao bì.',
          'Kiểm tra hoạt động cơ bản và chất lượng lắp đặt trước khi ký nhận.',
          'Nhận chứng từ mua hàng, hướng dẫn sử dụng và thông tin bảo hành áp dụng.',
          'Yêu cầu kích hoạt E-Warranty và kiểm tra lại thông tin khách hàng, sản phẩm, đại lý.',
        ],
      },
      {
        heading: '7. Thay đổi hoặc hủy đơn',
        paragraphs: [
          'Khách hàng nên thông báo sớm khi cần đổi thông tin hoặc hủy đơn. Khả năng xử lý phụ thuộc trạng thái đóng gói, vận chuyển, hàng đặt riêng và dịch vụ đã thực hiện.',
          'Chi phí thực tế đã phát sinh có thể được đối trừ trước khi hoàn tiền nếu đã được thông báo và phù hợp với thỏa thuận giao dịch.',
        ],
      },
      {
        heading: '8. Hỗ trợ mua hàng',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.WARRANTY_RETURN_POLICY,
    slug: 'chinh-sach-bao-hanh-doi-tra',
    title: 'Chính sách bảo hành - Đổi trả',
    summary:
      'Điều kiện, phạm vi, hồ sơ và quy trình bảo hành, đổi trả đối với sản phẩm FUJITEK và LEXZENZ chính hãng.',
    sections: [
      {
        heading: '1. Nguyên tắc bảo hành',
        paragraphs: [
          'Thời hạn và hình thức bảo hành khác nhau theo thương hiệu, model, phiên bản và chương trình bán hàng. Thông tin trên E-Warranty, sản phẩm hoặc chứng từ mua hàng là căn cứ áp dụng.',
          'Một số sản phẩm có thể áp dụng sửa chữa, thay linh kiện hoặc đổi sản phẩm khi lỗi được xác định thuộc phạm vi cam kết. Không mặc nhiên áp dụng một hình thức cho mọi model.',
        ],
      },
      {
        heading: '2. Điều kiện tiếp nhận',
        items: [
          'Sản phẩm chính hãng, nhận diện được model và số serial hoặc mã bảo hành.',
          'Sản phẩm còn thời hạn theo E-Warranty hoặc chứng từ hợp lệ.',
          'Lỗi phát sinh trong điều kiện sử dụng bình thường và thuộc phạm vi nhà sản xuất hoặc lắp đặt đã cam kết.',
          'Khách hàng cung cấp thông tin mua hàng, tình trạng lỗi và tài liệu cần thiết để kiểm tra.',
        ],
      },
      {
        heading: '3. Hồ sơ yêu cầu bảo hành',
        items: [
          'Họ tên, số điện thoại và địa chỉ liên hệ.',
          'Tên sản phẩm, model, serial, mã E-Warranty và ngày mua hoặc lắp đặt.',
          'Tên đại lý hoặc điểm lắp đặt.',
          'Mô tả lỗi, thời điểm phát sinh, ảnh hoặc video thể hiện tình trạng.',
          'Hóa đơn, phiếu giao hàng hoặc chứng từ liên quan khi cần đối chiếu.',
        ],
      },
      {
        heading: '4. Trường hợp ngoài phạm vi bảo hành',
        items: [
          'Hết thời hạn, không xác minh được nguồn gốc hoặc thông tin nhận diện bị tẩy xóa, sửa đổi.',
          'Hư hỏng do va chạm, tai nạn, ngập nước, cháy nổ bên ngoài, thiên tai hoặc môi trường sử dụng không phù hợp.',
          'Sử dụng sai điện áp, sai hướng dẫn, quá tải, bảo quản kém hoặc dùng phụ kiện không tương thích.',
          'Tự ý tháo lắp, sửa chữa, thay đổi phần mềm, kết cấu hoặc đấu nối ngoài hướng dẫn.',
          'Hao mòn tự nhiên, vật tư tiêu hao và suy giảm thẩm mỹ không ảnh hưởng chức năng, trừ khi model có cam kết khác.',
          'Chi phí hoặc thiệt hại gián tiếp phát sinh từ việc phương tiện tạm ngừng sử dụng, trừ trường hợp có thỏa thuận khác.',
        ],
      },
      {
        heading: '5. Quy trình xử lý bảo hành',
        items: [
          'Khách hàng gửi yêu cầu qua hotline, email, website, đại lý hoặc trung tâm hỗ trợ.',
          'Bộ phận tiếp nhận kiểm tra thông tin E-Warranty và hướng dẫn địa điểm hoặc phương thức gửi sản phẩm.',
          'Kỹ thuật viên kiểm tra, xác định nguyên nhân và thông báo phạm vi, phương án, chi phí ngoài bảo hành nếu có.',
          'Sản phẩm được sửa chữa, thay linh kiện hoặc đổi theo chính sách của model và kết quả kiểm tra.',
          'Khách hàng nhận lại sản phẩm, kiểm tra hoạt động và xác nhận hoàn tất.',
        ],
      },
      {
        heading: '6. Thời gian xử lý',
        paragraphs: [
          'Thời gian phụ thuộc tình trạng lỗi, linh kiện, model và nơi tiếp nhận. Bộ phận phụ trách sẽ thông báo dự kiến sau khi kiểm tra ban đầu.',
          'Thời gian có thể kéo dài nếu cần gửi sản phẩm về trung tâm, chờ linh kiện hoặc bổ sung thông tin. Mọi thay đổi đáng kể sẽ được cập nhật cho khách hàng.',
        ],
      },
      {
        heading: '7. Điều kiện xem xét đổi trả',
        items: [
          'Giao sai model, sai số lượng hoặc thiếu phụ kiện so với đơn hàng đã xác nhận.',
          'Sản phẩm hư hỏng rõ ràng trong quá trình giao và được ghi nhận khi nhận hàng.',
          'Sản phẩm có lỗi kỹ thuật được xác nhận và model áp dụng phương án đổi.',
          'Sản phẩm cần còn đầy đủ phụ kiện, quà tặng và bao bì trong phạm vi hợp lý, trừ phần phải mở để kiểm tra lỗi.',
        ],
      },
      {
        heading: '8. Trường hợp không áp dụng đổi trả',
        items: [
          'Thay đổi nhu cầu sau khi sản phẩm đã lắp đặt, kích hoạt hoặc sử dụng mà sản phẩm không có lỗi.',
          'Hàng đặt riêng, gia công theo xe hoặc dịch vụ đã hoàn thành đúng thỏa thuận.',
          'Hư hỏng do khách hàng vận chuyển, sử dụng, tháo lắp hoặc bảo quản không đúng hướng dẫn.',
          'Sản phẩm không thuộc kênh phân phối có thể xác minh của FUJITEK - LEXZENZ VIỆT NAM.',
        ],
      },
      {
        heading: '9. Kênh bảo hành và kỹ thuật',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.SHIPPING_POLICY,
    slug: 'chinh-sach-giao-hang',
    title: 'Chính sách giao hàng',
    summary:
      'Quy định về phạm vi, phương thức, thời gian dự kiến, chi phí và trách nhiệm kiểm tra khi nhận hàng.',
    sections: [
      {
        heading: '1. Phạm vi giao hàng',
        paragraphs: [
          'Đơn hàng được giao trong phạm vi đơn vị vận chuyển hoặc hệ thống đại lý có thể phục vụ. Một số khu vực xa, hạn chế giao thông hoặc sản phẩm đặc thù có điều kiện riêng.',
          'Sản phẩm cần lắp đặt có thể được chuyển đến đại lý hoặc điểm kỹ thuật phù hợp thay vì giao trực tiếp để bảo đảm kiểm tra và thi công.',
        ],
      },
      {
        heading: '2. Phương thức giao nhận',
        items: [
          'Nhận trực tiếp tại văn phòng, showroom hoặc đại lý đã xác nhận.',
          'Giao bởi nhân viên hoặc đại lý trong khu vực hỗ trợ.',
          'Giao qua đối tác vận chuyển đến địa chỉ khách hàng cung cấp.',
          'Giao đến điểm lắp đặt đối với sản phẩm cần kỹ thuật chuyên môn.',
        ],
      },
      {
        heading: '3. Xử lý và thời gian dự kiến',
        paragraphs: [
          'Đơn hàng được chuẩn bị sau khi thông tin, tồn kho và điều kiện thanh toán được xác nhận. Thời gian giao được tính theo ngày làm việc trừ khi có thông báo khác.',
          'Thời gian phụ thuộc địa chỉ, loại hàng, tồn kho, thời tiết và năng lực đơn vị vận chuyển. Mốc được thông báo là dự kiến, không phải cam kết tuyệt đối.',
        ],
      },
      {
        heading: '4. Chi phí giao hàng',
        paragraphs: [
          'Phí giao được xác định theo khu vực, kích thước, khối lượng, bảo hiểm hàng hóa và dịch vụ đi kèm. Khoản phí sẽ được thông báo trước khi đơn hàng được gửi.',
          'Ưu đãi miễn hoặc giảm phí chỉ áp dụng theo điều kiện của từng chương trình, khu vực và thời điểm.',
        ],
      },
      {
        heading: '5. Trách nhiệm cung cấp địa chỉ',
        items: [
          'Cung cấp đúng người nhận, số điện thoại, địa chỉ và chỉ dẫn cần thiết.',
          'Bảo đảm có người nhận trong khung thời gian đã thống nhất.',
          'Thông báo thay đổi trước khi hàng rời kho; thay đổi muộn có thể làm tăng thời gian hoặc chi phí.',
        ],
      },
      {
        heading: '6. Kiểm tra khi nhận hàng',
        items: [
          'Đối chiếu mã đơn, tên sản phẩm, model, số lượng và phụ kiện.',
          'Kiểm tra niêm phong, bao bì và dấu hiệu móp, vỡ, ướt hoặc bị can thiệp.',
          'Quay phim hoặc chụp ảnh khi mở kiện với hàng giá trị cao hoặc bao bì có dấu hiệu bất thường.',
          'Ghi chú với người giao và liên hệ ngay nếu phát hiện sai, thiếu hoặc hư hỏng.',
        ],
      },
      {
        heading: '7. Giao hàng không thành công',
        paragraphs: [
          'Đơn có thể được giao lại khi không liên hệ được, sai địa chỉ hoặc người nhận từ chối nhận. Phí giao lại hoặc hoàn hàng có thể được áp dụng theo chi phí thực tế.',
          'Với đơn đã thanh toán, phương án giao lại hoặc hoàn tiền được xử lý sau khi hàng quay về và tình trạng sản phẩm được kiểm tra.',
        ],
      },
      {
        heading: '8. Hỗ trợ giao nhận',
        items: contactItems,
      },
    ],
  },
  {
    kind: content_page_kind.PAYMENT_POLICY,
    slug: 'chinh-sach-thanh-toan',
    title: 'Chính sách thanh toán',
    summary:
      'Phương thức thanh toán, thời điểm xác nhận, chứng từ, hoàn tiền và nguyên tắc bảo đảm an toàn giao dịch.',
    sections: [
      {
        heading: '1. Nguyên tắc chung',
        paragraphs: [
          'Khách hàng thanh toán theo tổng giá trị và phương thức ghi trên đơn hàng, báo giá hoặc xác nhận từ kênh chính thức.',
          'Giá trị cuối cùng có thể gồm sản phẩm, phụ kiện, vận chuyển, lắp đặt và khoản khác đã được thông báo trước khi khách hàng xác nhận.',
        ],
      },
      {
        heading: '2. Phương thức thanh toán',
        items: [
          'Tiền mặt tại văn phòng, showroom, đại lý hoặc khi hoàn tất dịch vụ.',
          'Thanh toán khi nhận hàng nếu đơn hàng, khu vực và đơn vị vận chuyển hỗ trợ COD.',
          'Chuyển khoản vào tài khoản được nhân viên hoặc đơn vị bán hàng chính thức xác nhận.',
          'Phương thức điện tử khác nếu được hiển thị hoặc xác nhận hợp lệ tại thời điểm giao dịch.',
        ],
      },
      {
        heading: '3. Đặt trước và thanh toán theo tiến độ',
        paragraphs: [
          'Hàng đặt riêng, số lượng lớn hoặc dịch vụ cần chuẩn bị có thể yêu cầu đặt trước. Mức đặt trước, thời hạn và điều kiện hoàn được xác nhận trước khi thu tiền.',
          'Phần còn lại được thanh toán theo mốc đã thỏa thuận, thường trước khi giao hàng hoặc sau khi khách hàng nghiệm thu.',
        ],
      },
      {
        heading: '4. Xác nhận chuyển khoản',
        items: [
          'Kiểm tra đúng tên đơn vị hoặc chủ tài khoản, số tài khoản, ngân hàng và số tiền.',
          'Ghi họ tên, số điện thoại hoặc mã đơn hàng trong nội dung chuyển khoản.',
          'Lưu biên lai cho đến khi giao dịch và đơn hàng hoàn tất.',
          'Đơn hàng được ghi nhận đã thanh toán sau khi khoản tiền được đối soát thành công.',
        ],
      },
      {
        heading: '5. Hóa đơn và chứng từ',
        paragraphs: [
          'Khách hàng cung cấp thông tin xuất hóa đơn chính xác trong thời hạn được thông báo. Việc điều chỉnh hóa đơn thực hiện theo quy định và khả năng xử lý tại thời điểm yêu cầu.',
          'Biên nhận, phiếu giao hàng, hóa đơn hoặc xác nhận điện tử nên được lưu để đối chiếu đơn hàng và quyền lợi sau bán hàng.',
        ],
      },
      {
        heading: '6. Hoàn tiền',
        paragraphs: [
          'Khoản hoàn được thực hiện khi đơn bị hủy hợp lệ, giao dịch thu thừa hoặc yêu cầu đổi trả được chấp thuận. Giá trị hoàn căn cứ khoản thực nhận và chi phí hợp lệ đã phát sinh.',
          'Thời gian tiền về phụ thuộc phương thức thanh toán và ngân hàng. Khách hàng sẽ được thông báo thông tin cần thiết sau khi yêu cầu hoàn được duyệt.',
        ],
      },
      {
        heading: '7. An toàn giao dịch',
        items: [
          'Không chuyển tiền vào tài khoản cá nhân hoặc đường dẫn chưa được xác nhận qua kênh chính thức.',
          'Không cung cấp mật khẩu, mã OTP, mã PIN hoặc toàn bộ thông tin thẻ cho nhân viên hay bên vận chuyển.',
          'Kiểm tra tên fanpage, tên miền, số điện thoại và nội dung đơn trước khi thanh toán.',
          'Liên hệ ngay với ngân hàng và FUJITEK - LEXZENZ VIỆT NAM khi nghi ngờ giả mạo hoặc chuyển nhầm.',
        ],
      },
      {
        heading: '8. Hỗ trợ thanh toán',
        items: contactItems,
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

export async function seedPolicyContentPages(client: PrismaClient) {
  for (const policy of policySeeds) {
    const content = renderPolicyContent(policy.sections);

    await client.contentPage.upsert({
      where: { slug: policy.slug },
      update: {
        content,
        kind: policy.kind,
        published_at: new Date('2026-07-27T00:00:00.000Z'),
        status: content_page_status.PUBLISHED,
        summary: policy.summary,
        title: policy.title,
      },
      create: {
        content,
        kind: policy.kind,
        published_at: new Date('2026-07-27T00:00:00.000Z'),
        slug: policy.slug,
        status: content_page_status.PUBLISHED,
        summary: policy.summary,
        title: policy.title,
      },
    });
  }

  console.log(`Seeded ${policySeeds.length} Vietnamese policy content pages.`);
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

  await seedPolicyContentPages(prisma);
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

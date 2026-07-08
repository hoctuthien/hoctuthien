export const MENTEE_POLICY_CONFIG_KEY = 'mentee_policy';

export const defaultMenteePolicyConfig = {
  type: 'mentee_policy',
  title: 'Chính sách dành cho Mentee',
  version: '1.0',
  effectiveDate: '2026-07-31',
  subtitle: 'Nền tảng học trực tuyến vì cộng đồng',
  acknowledgement:
    'Bằng việc đăng ký và sử dụng nền tảng Học Từ Thiện, Mentee xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản trong chính sách này.',
  supportEmail: 'support@hoctuthien.com',
  websiteUrl: 'https://hoctuthien.com',
  sections: [
    {
      title: 'Điều 1. Định nghĩa và Đối tượng áp dụng',
      items: [
        'Mentee là cá nhân đăng ký tài khoản trên nền tảng Học Từ Thiện với mục đích tham gia các buổi học 1 kèm 1 trực tuyến cùng Mentor.',
        'Mentee chịu trách nhiệm hoàn tất nghĩa vụ học phí từ thiện sau mỗi buổi học theo đúng quy trình của nền tảng.',
        'Chính sách áp dụng cho mọi cá nhân đã đăng ký tài khoản Mentee trên nền tảng Học Từ Thiện.',
        'Chính sách này có hiệu lực kể từ thời điểm Mentee hoàn tất đăng ký tài khoản.',
      ],
    },
    {
      title: 'Điều 2. Quy trình đặt lịch học',
      items: [
        'Mentee đăng nhập vào hệ thống, mở danh sách khoá học và chọn khoá học phù hợp với nhu cầu.',
        'Mentee chọn khung giờ còn trống trong lịch của Mentor và xác nhận đặt lịch.',
        'Hệ thống gửi email xác nhận lịch học kèm link Google Meet đến cả Mentee và Mentor.',
        'Buổi học diễn ra theo đúng thời gian đã đặt qua Google Meet.',
        'Sau khi buổi học kết thúc, Mentee nhận email hướng dẫn hoàn tất chuyển khoản học phí từ thiện.',
        'Mentee không có học phí từ thiện nào còn tồn đọng từ buổi học trước đó.',
        'Mentee đặt lịch trước ít nhất 24 giờ so với thời gian buổi học dự kiến.',
        'Mỗi Mentee có thể đặt tối đa 2 buổi học đang chờ diễn ra cùng một lúc.',
      ],
    },
    {
      title: 'Điều 3. Học phí và Nghĩa vụ chuyển khoản từ thiện',
      items: [
        'Học Từ Thiện không thu phí trung gian và không giữ tiền của Mentee.',
        'Toàn bộ học phí được chuyển 100% trực tiếp từ Mentee đến quỹ từ thiện được chỉ định, không qua ví hoặc tài khoản trung gian của nền tảng.',
        'Học phí cho mỗi buổi học do Mentor quy định và hiển thị công khai trên trang thông tin khoá học.',
        'Đây là khoản đóng góp từ thiện của Mentee, không phải thù lao cho Mentor.',
        'Quỹ từ thiện nhận học phí là các tổ chức uy tín được Học Từ Thiện lựa chọn và hiển thị công khai.',
        'Sau khi buổi học kết thúc, hệ thống tự động gửi email nhắc nhở kèm mã QR của quỹ từ thiện đến Mentee.',
        'Mentee mở ứng dụng ngân hàng hoặc ví điện tử, quét mã QR và chuyển khoản đúng số tiền học phí.',
        'Hệ thống sẽ tự động xác thực giao dịch và hiển thị thông báo xác nhận đến Mentee.',
        'Mentee có trách nhiệm hoàn tất chuyển khoản trong vòng 24 giờ kể từ khi buổi học kết thúc.',
        'Nếu chưa hoàn tất trong thời hạn trên, hệ thống sẽ gửi email nhắc nhở.',
        'Nếu tiếp tục không thực hiện sau 48 giờ kể từ email nhắc nhở, tài khoản Mentee sẽ bị tạm hạn chế đặt lịch học mới.',
        'Hạn chế đặt lịch sẽ được tự động gỡ bỏ sau khi hệ thống xác nhận giao dịch thành công.',
      ],
    },
    {
      title: 'Điều 4. Chính sách huỷ lịch và Vắng mặt',
      items: [
        'Mentee có thể huỷ lịch học miễn phí nếu thông báo trước ít nhất 03 giờ trước giờ học.',
        'Việc huỷ lịch thực hiện qua hệ thống.',
        'Không có học phí phát sinh khi huỷ đúng thời hạn vì chưa có buổi học nào diễn ra.',
        'Nếu Mentee vắng mặt mà không thông báo trong vòng 2 giờ trước buổi học, buổi học được tính là đã diễn ra.',
        'Trong trường hợp vắng mặt không báo trước, Mentee vẫn có nghĩa vụ hoàn tất chuyển khoản học phí từ thiện như bình thường.',
        'Mentor có quyền quyết định có tổ chức buổi học bù hay không.',
        'Nếu Mentor vắng mặt hoặc có sự cố kỹ thuật từ phía nền tảng khiến buổi học không thể diễn ra, Mentee không phát sinh nghĩa vụ chuyển khoản.',
        'Hệ thống sẽ hỗ trợ Mentee đặt lại lịch học với Mentor hoặc tìm Mentor thay thế.',
      ],
    },
    {
      title: 'Điều 5. Quyền và Trách nhiệm của Mentee',
      items: [
        'Được tham gia buổi học 1 kèm 1 với Mentor đã chọn theo đúng thời gian và nội dung đã thoả thuận.',
        'Được nhận xác nhận giao dịch từ thiện sau mỗi buổi học.',
        'Được truy cập lịch sử các buổi học và tổng đóng góp từ thiện tích luỹ trên tài khoản.',
        'Được yêu cầu hỗ trợ từ đội ngũ Học Từ Thiện khi gặp vấn đề kỹ thuật hoặc tranh chấp với Mentor.',
        'Được phản hồi, đánh giá chất lượng Mentor sau mỗi buổi học.',
        'Cung cấp thông tin cá nhân chính xác và trung thực khi đăng ký tài khoản.',
        'Tham gia buổi học đúng giờ và chuẩn bị đầy đủ để tận dụng tối đa thời gian với Mentor.',
        'Hoàn tất chuyển khoản học phí từ thiện đúng thời hạn quy định sau mỗi buổi học.',
        'Ứng xử lịch sự, tôn trọng Mentor trong suốt quá trình học tập.',
        'Không ghi âm, ghi hình buổi học mà không có sự đồng ý của Mentor.',
        'Không sử dụng nền tảng cho các mục đích vi phạm pháp luật hoặc trái đạo đức.',
      ],
    },
    {
      title: 'Điều 6. Xử lý khiếu nại',
      items: [
        'Mentee có thể khiếu nại khi Mentor không xuất hiện hoặc kết thúc buổi học sớm hơn 20 phút so với thời lượng đã cam kết.',
        'Mentee có thể khiếu nại khi nội dung buổi học lệch đáng kể so với mô tả của khoá học.',
        'Mentee có thể khiếu nại khi hệ thống ghi nhận sai giao dịch chuyển khoản từ thiện.',
        'Mentee có thể khiếu nại khi Mentor có hành vi không phù hợp, thiếu chuyên nghiệp hoặc vi phạm quy tắc ứng xử.',
        'Mentee gửi khiếu nại qua email hỗ trợ hoặc fanpage Học Từ Thiện tối đa 05 ngày kể từ buổi học.',
        'Đội ngũ Học Từ Thiện xác nhận tiếp nhận trong vòng 12 giờ làm việc.',
        'Đội ngũ xem xét và phản hồi kết quả trong vòng 02 ngày làm việc.',
        'Biện pháp xử lý phù hợp có thể gồm nhắc nhở Mentor, thu xếp buổi học bù hoặc các biện pháp cần thiết khác.',
      ],
    },
    {
      title: 'Điều 7. Bảo mật và Dữ liệu cá nhân',
      items: [
        'Thông tin cá nhân của Mentee như họ tên, email và lịch sử học tập được bảo mật và chỉ sử dụng cho mục đích vận hành nền tảng.',
        'Học Từ Thiện không chia sẻ thông tin cá nhân của Mentee cho bên thứ ba ngoại trừ Mentor cần thiết cho buổi học và quỹ từ thiện theo quy định pháp luật.',
        'Thông tin giao dịch từ thiện có thể được tổng hợp và công bố công khai dưới dạng ẩn danh nhằm minh bạch hoá tác động của nền tảng.',
      ],
    },
    {
      title: 'Điều 8. Điều khoản chung',
      items: [
        'Học Từ Thiện có quyền cập nhật chính sách này theo thời gian.',
        'Mentee sẽ được thông báo qua email ít nhất 07 ngày trước khi thay đổi có hiệu lực.',
        'Việc tiếp tục sử dụng nền tảng sau khi chính sách được cập nhật đồng nghĩa với việc Mentee chấp nhận các thay đổi đó.',
        'Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng.',
        'Nếu không đạt được thoả thuận, các bên có thể đưa ra cơ quan có thẩm quyền theo quy định pháp luật Việt Nam.',
      ],
    },
  ],
};

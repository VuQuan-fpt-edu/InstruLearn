import { Button, Card } from "antd";
import { SoundOutlined, StarFilled } from "@ant-design/icons";

const instruments = [
  { name: "Guitar", image: "https://via.placeholder.com/150" },
  { name: "Piano", image: "https://via.placeholder.com/150" },
  { name: "Violin", image: "https://via.placeholder.com/150" },
  { name: "Drums", image: "https://via.placeholder.com/150" },
];

const testimonials = [
  {
    name: "Nguyễn Văn A",
    review: "Khoá học rất tuyệt vời! Tôi đã học được rất nhiều kỹ năng mới.",
    rating: 5,
  },
  {
    name: "Trần Thị B",
    review: "Giáo viên tận tâm, nội dung dễ hiểu. Rất đáng giá!",
    rating: 4.5,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-purple-800 text-white p-6 text-center flex flex-col items-center">
      <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg flex items-center">
        <SoundOutlined className="mr-3 text-4xl" /> Chào mừng đến với Trang học
        Nhạc cụ
      </h1>
      <p className="text-xl mb-6 max-w-3xl">
        Học nhạc cụ theo yêu cầu với giáo viên chuyên nghiệp. Khám phá các khoá
        học nâng cao giúp bạn thành thạo nhạc cụ yêu thích!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12 w-full max-w-5xl">
        {instruments.map((instrument) => (
          <Card
            key={instrument.name}
            hoverable
            cover={
              <img
                alt={instrument.name}
                src={instrument.image}
                className="rounded-t-lg"
              />
            }
            className="shadow-xl rounded-lg overflow-hidden bg-white text-gray-800 transform transition duration-300 hover:scale-105"
          >
            <Card.Meta
              title={
                <span className="font-bold text-lg">{instrument.name}</span>
              }
              className="p-4 text-center"
            />
          </Card>
        ))}
      </div>
      <h2 className="text-3xl font-bold mb-6">Học viên nói gì về chúng tôi?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white text-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center"
          >
            <StarFilled className="text-yellow-500 text-3xl mb-2" />
            <p className="italic mb-4">"{testimonial.review}"</p>
            <span className="font-bold">- {testimonial.name}</span>
          </div>
        ))}
      </div>

      <Button
        type="primary"
        size="large"
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg shadow-md transition duration-300"
      >
        Đăng ký ngay
      </Button>
    </div>
  );
}

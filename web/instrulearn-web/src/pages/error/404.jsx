import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function Page404() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <p className="text-xl text-gray-700 mt-4">
        Oops! Trang bạn tìm kiếm không tồn tại.
      </p>
      <Button
        type="primary"
        size="large"
        className="mt-6"
        onClick={() => navigate("/")}
      >
        Quay lại Trang chủ
      </Button>
    </div>
  );
}

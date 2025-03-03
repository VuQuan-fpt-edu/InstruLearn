import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SearchBar() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  return (
    <div className="search-container w-full md:w-96">
      <Input
        placeholder="Tìm kiếm khóa học..."
        prefix={<SearchOutlined className="text-gray-400" />}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onPressEnter={handleSearch}
        suffix={
          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-sm text-sm transition-colors"
          >
            Tìm
          </button>
        }
        className="rounded-sm"
      />
    </div>
  );
}

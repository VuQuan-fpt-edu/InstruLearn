import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Input,
  Divider,
  Typography,
} from "antd";
import {
  HomeOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  BellOutlined,
  UserOutlined,
  SearchOutlined,
  SettingOutlined,
  LogoutOutlined,
  InstagramOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  TwitterOutlined,
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function AppLayout({ children }) {
  const location = useLocation();
  const [searchVisible, setSearchVisible] = useState(false);

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Hồ sơ cá nhân</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">Cài đặt</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const notificationMenu = (
    <Menu>
      <Menu.Item key="notification1">
        <div className="py-2">
          <Text strong>Bài học mới đã được thêm</Text>
          <Text type="secondary" className="block text-xs">
            30 phút trước
          </Text>
        </div>
      </Menu.Item>
      <Menu.Item key="notification2">
        <div className="py-2">
          <Text strong>Nhắc nhở lịch học</Text>
          <Text type="secondary" className="block text-xs">
            2 giờ trước
          </Text>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="all">
        <Link to="/notifications">Xem tất cả thông báo</Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between px-8 bg-white shadow-md z-10 h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-8">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-700 to-purple-900 rounded-lg flex items-center justify-center mr-2">
              <PlayCircleOutlined className="text-base text-white" />
            </div>
            <Text strong className="text-lg">
              InstruLearn
            </Text>
          </Link>

          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            className="border-0"
          >
            <Menu.Item key="/" icon={<HomeOutlined />}>
              <Link to="/">Trang chủ</Link>
            </Menu.Item>
            <Menu.Item key="/courses" icon={<BookOutlined />}>
              <Link to="/courses">Khóa học</Link>
            </Menu.Item>
            <Menu.Item key="/instructors" icon={<TeamOutlined />}>
              <Link to="/instructors">Giảng viên</Link>
            </Menu.Item>
            <Menu.Item key="/achievements" icon={<TrophyOutlined />}>
              <Link to="/achievements">Thành tích</Link>
            </Menu.Item>
          </Menu>
        </div>

        <div className="flex items-center">
          {searchVisible ? (
            <Input
              placeholder="Tìm kiếm khóa học, giảng viên..."
              prefix={<SearchOutlined />}
              className="w-64 mr-4 rounded-lg"
              onBlur={() => setSearchVisible(false)}
              autoFocus
            />
          ) : (
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => setSearchVisible(true)}
              className="mr-3"
            />
          )}

          <Dropdown overlay={notificationMenu} trigger={["click"]}>
            <Badge count={3} className="mr-4">
              <Button
                type="text"
                icon={<BellOutlined className="text-xl" />}
                className="flex items-center justify-center"
              />
            </Badge>
          </Dropdown>

          <Dropdown overlay={userMenu} trigger={["click"]}>
            <div className="flex items-center cursor-pointer">
              <Avatar
                size="default"
                icon={<UserOutlined />}
                className="bg-purple-700"
              />
              <span className="ml-2 hidden md:inline">Học viên</span>
            </div>
          </Dropdown>
        </div>
      </Header>

      <Content className="bg-gray-50">
        <Outlet />
      </Content>

      <Footer className="bg-gray-900 text-white px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-700 to-purple-900 rounded-lg flex items-center justify-center mr-2">
                  <PlayCircleOutlined className="text-base text-white" />
                </div>
                <Text strong className="text-lg text-white">
                  InstruLearn
                </Text>
              </div>
              <Paragraph className="text-gray-400">
                Nền tảng học nhạc cụ trực tuyến hàng đầu Việt Nam với hơn 10,000
                bài học chất lượng cao từ các giảng viên chuyên nghiệp.
              </Paragraph>
              <div className="flex space-x-4 mt-4">
                <Button
                  type="text"
                  shape="circle"
                  icon={<FacebookOutlined className="text-lg text-blue-400" />}
                />
                <Button
                  type="text"
                  shape="circle"
                  icon={<InstagramOutlined className="text-lg text-pink-400" />}
                />
                <Button
                  type="text"
                  shape="circle"
                  icon={<YoutubeOutlined className="text-lg text-red-500" />}
                />
                <Button
                  type="text"
                  shape="circle"
                  icon={<TwitterOutlined className="text-lg text-blue-500" />}
                />
              </div>
            </div>

            <div>
              <Title level={5} className="text-white mb-4">
                Khám phá
              </Title>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/courses" className="hover:text-purple-400">
                    Tất cả khóa học
                  </Link>
                </li>
                <li>
                  <Link to="/instruments" className="hover:text-purple-400">
                    Nhạc cụ
                  </Link>
                </li>
                <li>
                  <Link to="/instructors" className="hover:text-purple-400">
                    Giảng viên
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="hover:text-purple-400">
                    Blog âm nhạc
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Title level={5} className="text-white mb-4">
                Trợ giúp & Hỗ trợ
              </Title>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/faq" className="hover:text-purple-400">
                    Câu hỏi thường gặp
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-purple-400">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link to="/community" className="hover:text-purple-400">
                    Cộng đồng
                  </Link>
                </li>
                <li>
                  <Link to="/feedback" className="hover:text-purple-400">
                    Gửi phản hồi
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Title level={5} className="text-white mb-4">
                Thông tin pháp lý
              </Title>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/terms" className="hover:text-purple-400">
                    Điều khoản sử dụng
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-purple-400">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-purple-400">
                    Chính sách cookie
                  </Link>
                </li>
                <li>
                  <Link to="/licenses" className="hover:text-purple-400">
                    Giấy phép
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Divider className="border-gray-700" />

          <div className="flex flex-col md:flex-row justify-between items-center pt-4">
            <Text className="text-gray-500 mb-2 md:mb-0">
              © {new Date().getFullYear()} InstruLearn. Bản quyền thuộc về
              InstruLearn
            </Text>
            <div className="flex space-x-4">
              <Link to="/terms" className="text-gray-500 hover:text-purple-400">
                Điều khoản
              </Link>
              <Link
                to="/privacy"
                className="text-gray-500 hover:text-purple-400"
              >
                Bảo mật
              </Link>
              <Link
                to="/cookies"
                className="text-gray-500 hover:text-purple-400"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}

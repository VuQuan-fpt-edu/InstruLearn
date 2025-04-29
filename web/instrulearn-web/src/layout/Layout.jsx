import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
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
  message,
  Spin,
  List,
  Empty,
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
  LoginOutlined,
  FormOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { getCurrentUser } from "../api/auth"; // Import the getCurrentUser function
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Cấu hình dayjs để sử dụng plugin relativeTime
dayjs.extend(relativeTime);

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

export default function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVisible, setSearchVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Kiểm tra trạng thái đăng nhập và lấy thông tin người dùng khi component mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          setLoading(true);
          const userData = await getCurrentUser();
          setCurrentUser(userData);
          setIsLoggedIn(true);
          // Lưu thêm accountId vào localStorage
          localStorage.setItem("accountId", userData.accountId);

          // Nếu đăng nhập thành công và có learnerId, lấy thông báo
          if (userData.learnerId) {
            fetchNotifications(userData.learnerId);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          message.error("Lỗi xác thực, vui lòng đăng nhập lại");
          localStorage.removeItem("authToken");
          localStorage.removeItem("accountId"); // Xóa accountId khi có lỗi
          setIsLoggedIn(false);
          setCurrentUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Hàm lấy thông báo từ API
  const fetchNotifications = async (learnerId) => {
    try {
      setLoadingNotifications(true);
      const response = await axios.get(
        `https://instrulearnapplication.azurewebsites.net/api/FeedbackNotification/check-notifications/${learnerId}`
      );

      if (response.data?.isSucceed) {
        setNotifications(response.data.data || []);
      } else {
        console.error("Failed to fetch notifications:", response.data?.message);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("accountId"); // Xóa accountId khi đăng xuất
    setIsLoggedIn(false);
    setCurrentUser(null);
    message.success("Đã đăng xuất thành công");
    navigate("/");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Hồ sơ cá nhân</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">Cài đặt</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  // Định dạng thông báo để hiển thị
  const formatNotification = (notification) => {
    let icon = <FormOutlined className="text-blue-500" />;

    // Kiểm tra trạng thái thông báo để hiển thị icon phù hợp
    if (notification.progressPercentage > 0) {
      icon = <BookOutlined className="text-green-500" />;
    }

    if (notification.remainingPayment > 0) {
      icon = <WalletOutlined className="text-orange-500" />;
    }

    return {
      icon: icon,
      title: `Phản hồi khóa học với giáo viên ${notification.teacherName}`,
      description: notification.message,
      time: dayjs(notification.createdAt).fromNow(),
      link: `/feedback/${notification.feedbackId}`,
    };
  };

  const notificationMenu = (
    <Menu className="notification-menu">
      <div className="p-2 border-b">
        <Text strong>Thông báo</Text>
      </div>
      {loadingNotifications ? (
        <div className="p-4 text-center">
          <Spin size="small" />
          <div className="mt-2">Đang tải thông báo...</div>
        </div>
      ) : notifications && notifications.length > 0 ? (
        <>
          <List
            itemLayout="horizontal"
            dataSource={notifications.slice(0, 5).map(formatNotification)}
            renderItem={(item) => (
              <Menu.Item key={item.link}>
                <Link to={item.link}>
                  <div className="flex items-start space-x-3 py-2">
                    <div className="flex-shrink-0 mt-1">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <Text strong className="block text-sm mb-1">
                        {item.title}
                      </Text>
                      <Text className="block text-xs text-gray-500 mb-1 truncate max-w-[250px]">
                        {item.description}
                      </Text>
                      <Text className="block text-xs text-gray-400">
                        {item.time}
                      </Text>
                    </div>
                  </div>
                </Link>
              </Menu.Item>
            )}
          />
          <Menu.Divider />
          <Menu.Item key="all" className="text-center">
            <Link to="/notification">Xem tất cả thông báo</Link>
          </Menu.Item>
        </>
      ) : (
        <div className="p-4">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo"
          />
        </div>
      )}
    </Menu>
  );

  const handleLogin = () => {
    navigate("/login");
  };

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
            <Menu.Item key="/home-allcourse" icon={<BookOutlined />}>
              <Link to="/home-allcourse">Khóa học online</Link>
            </Menu.Item>
            <Menu.Item key="/teacher-list" icon={<TeamOutlined />}>
              <Link to="/teacher-list">Giảng viên</Link>
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

          {loading ? (
            <Spin size="small" className="mr-4" />
          ) : isLoggedIn && currentUser ? (
            <>
              <Dropdown
                overlay={notificationMenu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Badge count={notifications.length} className="mr-4">
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
                    src={currentUser.avatar}
                    className="bg-purple-700"
                  />
                  <span className="ml-2 hidden md:inline">
                    {currentUser.username || "Người dùng"}
                  </span>
                </div>
              </Dropdown>
            </>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleLogin}
              className="bg-purple-700 hover:bg-purple-800"
            >
              Đăng nhập
            </Button>
          )}
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
                  <Link to="/home-allcourse" className="hover:text-purple-400">
                    Tất cả khóa học
                  </Link>
                </li>
                <li>
                  <Link to="/home-allcourse" className="hover:text-purple-400">
                    Nhạc cụ
                  </Link>
                </li>
                <li>
                  <Link to="/teacher-list" className="hover:text-purple-400">
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
      <style jsx global>{`
        .notification-menu {
          width: 320px;
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-menu .ant-dropdown-menu-item {
          padding: 8px 12px;
        }

        .notification-menu .ant-list-item {
          padding: 8px 0;
        }
      `}</style>
    </Layout>
  );
}

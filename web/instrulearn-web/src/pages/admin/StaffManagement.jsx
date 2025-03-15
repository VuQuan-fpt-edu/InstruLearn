import { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ASidebar from "../../components/admin/AdminSidebar";
import AHeader from "../../components/admin/AdminHeader";

const { Content } = Layout;

const StaffManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("staff");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const data = [
      {
        id: 1,
        name: "Nguyễn Văn A",
        email: "a@example.com",
        phone: "123456789",
      },
      { id: 2, name: "Trần Thị B", email: "b@example.com", phone: "987654321" },
    ];
    setEmployees(data);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingEmployee(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
    message.success("Xóa nhân viên thành công!");
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingEmployee) {
        setEmployees(
          employees.map((emp) =>
            emp.id === editingEmployee.id ? { ...emp, ...values } : emp
          )
        );
        message.success("Cập nhật nhân viên thành công!");
      } else {
        setEmployees([...employees, { id: Date.now(), ...values }]);
        message.success("Thêm nhân viên thành công!");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="h-screen">
      <ASidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={toggleCollapsed}
      />
      <Layout>
        <AHeader
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Quản lý Nhân viên</h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Thêm nhân viên
              </Button>
            </div>
            <Table
              dataSource={employees}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
            <Modal
              title={editingEmployee ? "Chỉnh sửa Nhân viên" : "Thêm Nhân viên"}
              open={isModalOpen}
              onOk={handleSave}
              onCancel={() => setIsModalOpen(false)}
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  name="name"
                  label="Tên"
                  rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                >
                  {" "}
                  <Input />{" "}
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Vui lòng nhập email hợp lệ!",
                    },
                  ]}
                >
                  {" "}
                  <Input />{" "}
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                  ]}
                >
                  {" "}
                  <Input />{" "}
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffManagement;

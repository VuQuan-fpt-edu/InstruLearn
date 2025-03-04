import React, { useState, useEffect } from "react";
import { Layout, Form, Input, Button, Select, message } from "antd";
import axios from "axios";
import SSidebar from "../components/StaffSidebar";
import SHeader from "../components/StaffHeader";

const { Content } = Layout;
const { Option } = Select;

const AddCourse = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("add-course");
  const [instrumentTypes, setInstrumentTypes] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    axios
      .get(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseType/get-all"
      )
      .then((response) => {
        if (response.data.isSucceed) {
          setInstrumentTypes(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching instrument types:", error);
      });
  }, []);

  const handleSubmit = (values) => {
    axios
      .post(
        "https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/create",
        values
      )
      .then((response) => {
        message.success("Khóa học đã được thêm thành công!");
        form.resetFields();
      })
      .catch((error) => {
        console.error("Error creating course:", error);
        message.error("Có lỗi xảy ra khi thêm khóa học.");
      });
  };

  return (
    <Layout className="h-screen">
      <SSidebar
        collapsed={collapsed}
        selectedMenu={selectedMenu}
        onMenuSelect={setSelectedMenu}
        toggleCollapsed={() => setCollapsed(!collapsed)}
      />
      <Layout>
        <SHeader
          collapsed={collapsed}
          toggleCollapsed={() => setCollapsed(!collapsed)}
          selectedMenu={selectedMenu}
        />
        <Content className="p-6 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Thêm Khóa Học</h2>
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item
              name="courseName"
              label="Tên khóa học"
              rules={[
                { required: true, message: "Vui lòng nhập tên khóa học!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="courseDescription" label="Mô tả khóa học">
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item name="headline" label="Tiêu đề">
              <Input />
            </Form.Item>

            <Form.Item name="rating" label="Đánh giá">
              <Input type="number" min={0} max={5} step={0.1} />
            </Form.Item>

            <Form.Item name="price" label="Giá">
              <Input type="number" min={0} />
            </Form.Item>

            <Form.Item name="discount" label="Giảm giá">
              <Input type="number" min={0} max={100} />
            </Form.Item>

            <Form.Item name="imageUrl" label="URL Hình ảnh">
              <Input />
            </Form.Item>

            <Form.Item
              name="typeId"
              label="Loại nhạc cụ"
              rules={[
                { required: true, message: "Vui lòng chọn loại nhạc cụ!" },
              ]}
            >
              <Select placeholder="Chọn loại nhạc cụ">
                {instrumentTypes.map((instrument) => (
                  <Option key={instrument.typeId} value={instrument.typeId}>
                    {instrument.typeName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Thêm khóa học
              </Button>
            </Form.Item>
          </Form>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddCourse;

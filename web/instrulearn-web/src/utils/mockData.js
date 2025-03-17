// Mock data for courses
export const mockCourses = [
  {
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    courseDescription: "Khóa học dành cho người mới bắt đầu học piano",
    headline: "Làm quen với đàn piano",
    price: 2000000,
    discount: 10,
    rating: 4.5,
    imageUrl: "https://example.com/piano-course.jpg",
    typeId: 1,
    typeName: "Piano",
  },
  {
    courseId: 2,
    courseName: "Khóa học Guitar nâng cao",
    courseDescription:
      "Khóa học dành cho người đã có kiến thức cơ bản về guitar",
    headline: "Nâng cao kỹ năng chơi guitar",
    price: 2500000,
    discount: 5,
    rating: 4.8,
    imageUrl: "https://example.com/guitar-course.jpg",
    typeId: 2,
    typeName: "Guitar",
  },
  {
    courseId: 3,
    courseName: "Khóa học Violin cơ bản",
    courseDescription: "Khóa học dành cho người mới bắt đầu học violin",
    headline: "Làm quen với đàn violin",
    price: 3000000,
    discount: 15,
    rating: 4.2,
    imageUrl: "https://example.com/violin-course.jpg",
    typeId: 3,
    typeName: "Violin",
  },
];

// Mock data for instrument types
export const mockInstrumentTypes = [
  { typeId: 1, typeName: "Piano" },
  { typeId: 2, typeName: "Guitar" },
  { typeId: 3, typeName: "Violin" },
  { typeId: 4, typeName: "Trống" },
  { typeId: 5, typeName: "Sáo" },
];

// Mock data for item types
export const mockItemTypes = [
  { itemTypeId: 1, itemTypeName: "Video" },
  { itemTypeId: 2, itemTypeName: "Tài liệu" },
  { itemTypeId: 3, itemTypeName: "Hình ảnh" },
];

// Mock data for course contents
export const mockCourseContents = {
  1: {
    contentId: 1,
    heading: "Giới thiệu về Piano",
    courseId: 1,
    courseContentItems: [
      {
        itemId: 1,
        itemTypeId: 1,
        contentId: 1,
        itemDes: "https://example.com/intro-video.mp4",
      },
      {
        itemId: 2,
        itemTypeId: 2,
        contentId: 1,
        itemDes: "Tài liệu giới thiệu về lịch sử và cấu tạo đàn piano",
      },
    ],
  },
  2: {
    contentId: 2,
    heading: "Kỹ thuật Guitar cơ bản",
    courseId: 2,
    courseContentItems: [
      {
        itemId: 3,
        itemTypeId: 1,
        contentId: 2,
        itemDes: "https://example.com/guitar-basic.mp4",
      },
    ],
  },
};

// Mock data for teachers
export const mockTeachers = [
  {
    teacherId: 1,
    teacherName: "Nguyễn Văn A",
    phone: "0901234567",
    email: "teachera@gmail.com",
    specialization: "Piano",
    rating: 4.8,
    status: "active",
  },
  {
    teacherId: 2,
    teacherName: "Trần Thị B",
    phone: "0901234568",
    email: "teacherb@gmail.com",
    specialization: "Guitar",
    rating: 4.5,
    status: "active",
  },
];

// Mock data for students
export const mockStudents = [
  {
    studentId: 1,
    studentName: "Lê Văn X",
    phone: "0909123456",
    email: "studentx@gmail.com",
    address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  },
  {
    studentId: 2,
    studentName: "Phạm Thị Y",
    phone: "0909123457",
    email: "studenty@gmail.com",
    address: "456 Lê Văn Việt, Quận 9, TP.HCM",
  },
];

// Mock data for personal teaching schedules
export const mockPersonalSchedules = [
  {
    scheduleId: 1,
    teacherId: 1,
    teacherName: "Nguyễn Văn A",
    studentId: 1,
    studentName: "Lê Văn X",
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    date: "2025-03-20",
    startTime: "14:00",
    duration: "90",
    status: "scheduled",
    notes: "Học viên yêu cầu tập trung vào kỹ thuật legato",
  },
  {
    scheduleId: 2,
    teacherId: 2,
    teacherName: "Trần Thị B",
    studentId: 2,
    studentName: "Phạm Thị Y",
    courseId: 2,
    courseName: "Khóa học Guitar nâng cao",
    address: "456 Lê Văn Việt, Quận 9, TP.HCM",
    date: "2025-03-21",
    startTime: "09:00",
    duration: "120",
    status: "scheduled",
    notes: "Chuẩn bị bài fingerstyle mới",
  },
  {
    scheduleId: 3,
    teacherId: 1,
    teacherName: "Nguyễn Văn A",
    studentId: 2,
    studentName: "Phạm Thị Y",
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    address: "456 Lê Văn Việt, Quận 9, TP.HCM",
    date: "2025-03-19",
    startTime: "14:00",
    duration: "45",
    status: "completed",
    notes: "Đã hoàn thành bài học cơ bản về hợp âm",
  },
];

// Mock data for rooms
export const mockRooms = [
  {
    roomId: 1,
    roomName: "Phòng Piano 1",
    capacity: 10,
    description: "Phòng học piano với 5 đàn piano điện",
    status: "active",
  },
  {
    roomId: 2,
    roomName: "Phòng Guitar 1",
    capacity: 15,
    description: "Phòng học guitar với âm thanh cách âm",
    status: "active",
  },
  {
    roomId: 3,
    roomName: "Phòng Violin 1",
    capacity: 8,
    description: "Phòng học violin với gương lớn",
    status: "active",
  },
];

// Mock data for class schedules
export const mockClassSchedules = [
  {
    scheduleId: 1,
    teacherId: 1,
    teacherName: "Nguyễn Văn A",
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    roomId: 1,
    roomName: "Phòng Piano 1",
    date: "2025-03-20",
    startTime: "14:00",
    duration: "90",
    maxStudents: 10,
    enrolledStudents: [
      {
        studentId: 1,
        studentName: "Lê Văn X",
        attendance: "present", // present, absent, late
      },
      {
        studentId: 2,
        studentName: "Phạm Thị Y",
        attendance: "late",
      },
    ],
    status: "scheduled", // scheduled, completed, cancelled
    notes: "Buổi học về kỹ thuật legato cơ bản",
  },
  {
    scheduleId: 2,
    teacherId: 2,
    teacherName: "Trần Thị B",
    courseId: 2,
    courseName: "Khóa học Guitar nâng cao",
    roomId: 2,
    roomName: "Phòng Guitar 1",
    date: "2025-03-21",
    startTime: "09:00",
    duration: "120",
    maxStudents: 15,
    enrolledStudents: [
      {
        studentId: 3,
        studentName: "Nguyễn Văn Z",
        attendance: "present",
      },
    ],
    status: "scheduled",
    notes: "Buổi học về kỹ thuật fingerstyle",
  },
  {
    scheduleId: 3,
    teacherId: 1,
    teacherName: "Nguyễn Văn A",
    courseId: 1,
    courseName: "Khóa học Piano cơ bản",
    roomId: 1,
    roomName: "Phòng Piano 1",
    date: "2025-03-19",
    startTime: "14:00",
    duration: "45",
    maxStudents: 10,
    enrolledStudents: [
      {
        studentId: 1,
        studentName: "Lê Văn X",
        attendance: "present",
      },
      {
        studentId: 2,
        studentName: "Phạm Thị Y",
        attendance: "absent",
      },
    ],
    status: "completed",
    notes: "Đã hoàn thành bài học về hợp âm cơ bản",
  },
];

// Helper functions
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApiResponse = async (data, error = null) => {
  await delay(500); // Simulate network delay
  if (error) {
    throw new Error(error);
  }
  return {
    data: {
      isSucceed: true,
      data: data,
      message: "Thành công",
    },
  };
};

export const mockApiCall = async (mockData, error = null) => {
  try {
    const response = await mockApiResponse(mockData, error);
    return response.data;
  } catch (error) {
    console.error("Mock API Error:", error);
    throw error;
  }
};

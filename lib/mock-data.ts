export const MOCK_COURSES = [
  {
    id: "robotics-advanced",
    title: "Advanced Robotics & AI Integration",
    description: "Deep dive into autonomous navigation, machine vision, and real-time control systems using industry-standard protocols.",
    level: "Advanced",
    time: "24 hrs",
    sections: [
      {
        id: "sec-1",
        title: "Introduction to Autonomous Systems",
        order: 1,
        lessons: [
          {
            id: "les-1-1",
            title: "Course Overview & Learning Path",
            description: "Welcome to the Advanced Robotics program. In this lesson, we outline the roadmap for mastering AI-driven robotics.",
            drive_file_id: "1_h9_xWp6x_Vp9R7Wf-V9V-V9V-V9V",
            url: "https://www.w3schools.com/html/mov_bbb.mp4", // Using a sample video for demonstration
            resource_url: "https://google.com",
            order: 1
          },
          {
            id: "les-1-2",
            title: "Safety Protocols in Industrial Robotics",
            description: "Essential safety guidelines for working with high-torque actuators and high-voltage power systems.",
            drive_file_id: "2",
            url: "https://www.w3schools.com/html/movie.mp4",
            order: 2
          }
        ]
      },
      {
        id: "sec-2",
        title: "Sensor Fusion & Perception",
        order: 2,
        lessons: [
          {
            id: "les-2-1",
            title: "LIDAR Data Processing",
            description: "Learn how to process point cloud data to create real-time maps of the robot's environment.",
            drive_file_id: "3",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            resource_url: "https://google.com",
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: "mechatronics-fundamentals",
    title: "Mechatronics Fundamentals",
    description: "The bridge between mechanical engineering, electronics, and software. Build your first fully integrated system.",
    level: "Intermediate",
    time: "15 hrs",
    sections: [
      {
        id: "sec-m1",
        title: "Electronic Components",
        order: 1,
        lessons: [
          {
            id: "les-m1-1",
            title: "Working with Microcontrollers",
            description: "Understanding GPIO, PWM, and communication interfaces for robotics control.",
            drive_file_id: "4",
            url: "https://www.w3schools.com/html/movie.mp4",
            order: 1
          }
        ]
      }
    ]
  }
];

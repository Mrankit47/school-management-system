import React from "react";
import MainLayout from "./MainLayout";

const TeacherLayout = ({ children }) => {
<<<<<<< HEAD
  return (
    <MainLayout>
      <div
        style={{
          borderBottom: "2px solid #28a745",
          marginBottom: "20px",
          paddingBottom: "10px",
        }}
      >
        <span style={{ color: "#28a745", fontWeight: "bold" }}>
          Teacher's Workspace
        </span>
      </div>
      {children}
    </MainLayout>
  );
=======
    return (
        <MainLayout>
            <div className="border-b-2 border-[#28a745] mb-5 pb-2.5">
                <span className="text-[#28a745] font-bold">Teacher&apos;s Workspace</span>
            </div>
            {children}
        </MainLayout>
    );
>>>>>>> 92f67f0882aee1dc0c8b0ac2cf8decd6c701d545
};

export default TeacherLayout;

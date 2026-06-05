import React from "react";
import MainLayout from "./MainLayout";

const StudentLayout = ({ children }) => {
<<<<<<< HEAD
  return (
    <MainLayout>
      <div
        style={{
          borderBottom: "2px solid #17a2b8",
          marginBottom: "20px",
          paddingBottom: "10px",
        }}
      >
        <span style={{ color: "#17a2b8", fontWeight: "bold" }}>
          Student Portal
        </span>
      </div>
      {children}
    </MainLayout>
  );
=======
    return (
        <MainLayout>
            <div className="border-b-2 border-[#17a2b8] mb-5 pb-2.5">
                <span className="text-[#17a2b8] font-bold">Student Portal</span>
            </div>
            {children}
        </MainLayout>
    );
>>>>>>> 92f67f0882aee1dc0c8b0ac2cf8decd6c701d545
};

export default StudentLayout;

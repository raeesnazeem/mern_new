import React from "react"
import Sidebar from "../common/Sidebar"
import Header from "../layout/Header"


const MainLayout = ({ children }) => {
    return (
        <div className="appContainer">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main>{children}</main>
            </div>
        </div>
    )
}

export default MainLayout
import React from "react"
import { NavLink } from "react-router-dom"


const Sidebar = () => {
    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    <li>
                        <NavLink to="/dashboard" activeClassName="active">
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <Navlink to="/templates" activeClassName="active">
                            Templates
                        </Navlink>                      
                    </li>
                    <li>
                        <Navlink to="/builder" activeClassName="active">
                            Webpage Builder
                        </Navlink>
                    </li>
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar
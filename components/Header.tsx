import { Bell, ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";
import avatar from "@/assets/avatar.png";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between h-20 px-6 lg:px-20"
      style={{
        background: "linear-gradient(90deg, #11191A 0%, #296377 100%)",
        boxShadow: "0px 4px 15.4px 0px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="flex items-center gap-3">
        <img src={logo.src} alt="iMeeting" className="max-h-10 w-auto" />
        <h3 className="text-white font-semibold text-xl">iMeeting</h3>
      </div>
      <div className="flex items-center gap-4">
        <Bell className="text-white w-5 h-5" />
        <div className="flex items-center gap-2">
          <img src={avatar.src} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-white text-sm">John Doe</span>
          <ChevronDown className="text-white w-4 h-4" />
        </div>
      </div>
    </header>
  );
}

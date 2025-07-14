import Player from "lottie-react";
import animationData from "@/assets/CustomLoader.json"; // use relative path if not using alias

const CustomLoader = () => (
    <div className="flex flex-col items-center justify-center py-10">
        <Player
            autoplay
            loop
            animationData={animationData} // ✅ Correct!
            style={{ height: "200px", width: "200px" }}
        />
        <p className="mt-4 text-black font-bold text-2xl">Loading...</p>
    </div>
);

export default CustomLoader;

"use client";
import React, { useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Header from "./header";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { useScroll, useTransform, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import Video from "../common/video";

const Hero = () => {
	const t = useTranslations("hero");
	const locale = useLocale();
	const container = useRef(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ["start start", "end end"],
	});
	const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
	const isMobile = useClientMediaQuery("(max-width: 640px)");
	const { theme } = useTheme();
	return (
		<div
			ref={container}
			// className={`hero-section max-w-[1600px] text-lightColor mx-auto relative h-[100vh] sm:h-[120vh]`}
			className={`hero-section text-lightColor mx-auto relative h-[100vh] sm:h-[120vh]`}
		>
			<div className='sticky overflow-hidden top-0 h-[100vh]'>
				<motion.div
					style={{ scale: isMobile ? 1 : scale }}
					// className='absolute top-0 w-full h-full flex items-center justify-center'
				>
					{/* <Header /> */}
					<section className='home'>
						<Video
							preload='auto'
							className='absolute top-0 left-0 w-full h-full object-cover'
							src='/videos/bg-hero1.mp4'
							fallbackImage='/images/bg-hero.webp'
						/>
						<div className='home-content'>
							<h1 className="uppercase">{t("title_1")}</h1>
							<h1 className="uppercase">{t("title_2")}</h1>
							<h3>{t("subtitle")}</h3>
							<p className='text-lightColor'>{t("description")}</p>
							<div className='btn-box'>
								<Link
									href={`/${locale}/checkout?plan=monthly`}
									className='relative h-[50px] w-40 overflow-hidden border border-primaryColor bg-primaryColor text-darkColor shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:duration-500 after:absolute after:right-0 after:top-0 after:h-full after:w-0 after:duration-500 hover:text-primaryColor hover:before:w-2/4 hover:before:bg-darkColor hover:after:w-2/4 hover:after:bg-darkColor'
								>
									<span className='relative z-10'>{t("start_now")}</span>
								</Link>
								<Link
									href='#about'
									className='relative h-[50px] w-40 overflow-hidden border border-primaryColor bg-transparent text-primaryColor shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:duration-500 after:absolute after:right-0 after:top-0 after:h-full after:w-0 after:duration-500 hover:text-darkColor hover:before:w-2/4 hover:before:bg-lightColor hover:after:w-2/4 hover:after:bg-lightColor hover:border-darkColor'
								>
									<span className='relative z-10'>{t("get_to_know_me")}</span>
								</Link>
							</div>
							<div className='home-sci'>
								{/* <Link target="_blank" href='#'>
									<FaTwitter />
								</Link> */}
								<Link target="_blank" href='https://www.instagram.com/alegerez/'>
									<FaInstagram />
								</Link>
								<Link target="_blank" href='https://www.facebook.com/alejandro.gerezcdp/'>
									<FaFacebookF />
								</Link>
							</div>
						</div>

						<span
						className='home-imgHover'
							// className={`${
							// 	theme === "light" ? "home-imgHover" : "home-imgHoverBlack"
							// } hover:bg-lightColor dark:hover:bg-darkColor hover:opacity-10`}
						></span>
					</section>
				</motion.div>
			</div>
		</div>
	);
};

export default Hero;

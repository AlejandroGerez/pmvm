"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DumbbellIcon, Menu, X } from "lucide-react";
import LanguageSelector from "../common/language-selector";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import ThemeSelector from "../common/theme-selector";
import { motion } from "framer-motion";

const Header = () => {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 150) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<motion.header
			className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
				isScrolled ? "bg-darkColor opacity-80" : "bg-transparent"
			}`}
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<Navbar />
		</motion.header>
	);
};

export default Header;

export const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const t = useTranslations("header");
	const locale = useLocale();
	const navItems = [
		{ name: "about", href: "#about" },
		{ name: "transformations", href: "#transformations" },
		{ name: "start_your_change", href: "#pricing" },
	];
	return (
		<nav className='navbar shadow-md'>
			<div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-16 relative z-[1]'>
					<div className='flex-shrink-0 flex items-center'>
						<Logo className='logo' />
					</div>

					<div className='hidden sm:flex sm:items-center sm:justify-center flex-1'>
						{navItems.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className='px-2 py-1 rounded-md text-xs font-medium'
							>
								{t(item.name)}
							</Link>
						))}
					</div>

					{/* Botón Planes — desktop */}
					<div className='hidden sm:flex sm:items-center sm:mr-2'>
						<Link
							href={`/${locale}#pricing`}
							className='px-4 py-2 rounded-lg bg-primaryColor text-darkColor text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity'
						>
							Ver planes
						</Link>
					</div>

					<div className='hidden sm:flex sm:items-center'>
						<ThemeSelector />
					</div>

					<div className='hidden sm:flex sm:items-center'>
						<LanguageSelector />
					</div>

					{/* Mobile menu button */}
					<div className='sm:hidden flex items-center z-[1]'>
						<Sheet open={isOpen} onOpenChange={setIsOpen}>
							<SheetTrigger asChild>
								<Button
									variant='ghost'
									className='inline-flex items-center justify-center p-2 rounded-md tex-white hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primaryColor'
									onClick={() => setIsOpen(!isOpen)}
								>
									<span className='sr-only'>Abrir menú principal</span>
									<Menu
										className='h-6 w-6 text-lightColor'
										aria-hidden='true'
									/>
								</Button>
							</SheetTrigger>
							<SheetContent
								side='right'
								className='w-screen sm:w-[500px] bg-lightColor dark:bg-darkColor'
							>
								<nav className='flex flex-col h-full'>
									<div className='flex items-center justify-between mb-8 ml-2'>
										<Logo />
									</div>
									<div className='flex flex-col space-y-4 items-center'>
										{navItems.map((item) => (
											<Link
												key={item.name}
												href={item.href}
												className='px-3 py-2 rounded-md text-base font-medium text-darkColor dark:text-white'
												onClick={() => setIsOpen(!isOpen)}
											>
												{t(item.name)}
											</Link>
										))}
										{/* Botón Planes — mobile */}
										<Link
											href={`/${locale}#pricing`}
											onClick={() => setIsOpen(false)}
											className='w-40 text-center px-4 py-3 rounded-lg bg-primaryColor text-darkColor text-sm font-black uppercase tracking-wider hover:opacity-90 transition-opacity'
										>
											Ver planes →
										</Link>
									</div>
									<div className='mt-auto mb-8 flex justify-around items-center'>
										<ThemeSelector />
										<LanguageSelector />
									</div>
								</nav>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</nav>
	);
};

const Logo = ({ className }: { className?: string }) => {
	return (
		<Link className={className} href='#'>
			<Avatar className='h-12 w-12'>
				<AvatarImage
					className='bg-white'
					src={`/images/icon.webp`}
					alt={"Pesar Menos Vivir Más"}
				/>
				<AvatarFallback>PMVM</AvatarFallback>
			</Avatar>
		</Link>
	);
};

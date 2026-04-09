"use client";
import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import pricingData from "@/data/plans.json";
import { motion } from "framer-motion";
import { Check, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import DynamicIcon from "../common/icon";

const typedPricingData: any[] = pricingData;

const Pricing = () => {
	const { theme } = useTheme();

	return (
		<section
			id='pricing'
			style={{
				backgroundImage:
					theme === "light"
						? "url(/images/background-texture.webp)"
						: "url(/images/background-texture-dark.png)",
			}}
			className='h-full bg-cover bg-center bg-fixed bg-no-repeat dark:bg-gray-800 px-2'
		>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='container px-4 md:px-6'
			>
				<div className='container px-6 py-8 mx-auto'>
					<div
						className={`flex gap-6 mt-16 -mx-6 sm:gap-8 flex-wrap justify-center`}
					>
						{typedPricingData.map((plan, index) => (
							<PlanCard plan={plan} key={index} />
						))}
					</div>
				</div>
			</motion.div>
		</section>
	);
};

export default Pricing;

interface PlanCardProps {
	plan: any;
}
const PlanCard = ({ plan }: PlanCardProps) => {
	const t = useTranslations("general");
	const locale = useLocale();
	return (
		<div
			id='pricing'
			className='px-4 sm:px-4 py-2 sm:py-4 mx-4 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-95 border border-opacity-20 duration-1000 ease-in-out transform rounded-lg transition-transform max-w-[500px] cursor-pointer hover:bg-lightColor hover:bg-opacity-20
		bg-white dark:bg-darkColor hover:text-darkColor hover:dark:text-lightColor hover:opacity-100'
		>
			<div className='text-base sm:text-lg bg-primaryColor text-darkColor text-center rounded-md mb-3 uppercase'>
				{t("monthly_payment")}
			</div>
			<div className='text-2xl sm:text-4xl font-bold text-center'>
				<p className='py-3'>{plan.title[locale]}</p>
				{/* <p className='text-sm opacity-50 sm:min-h-[5rem]'>
					{plan.description[locale]}
				</p> */}
			</div>
			{/* <h4 className='mt-2 text-lg sm:text-2xl font-semibold text-primaryColor text-center'>
				{plan.price[locale]}
			</h4> */}
			{/* <div className='mt-8 space-y-3.5 sm:space-y-4 sm:min-h-[32rem]'>
				{plan.items.map((item: any, itemIndex: number) => {
					const text = item[locale];
					const truncatedText =
						text.length > 160 ? `${text.slice(0, 160)}...` : text;
					return (
						<div key={itemIndex} className='flex items-center'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='w-5 h-5 text-primaryColor min-w-[16px] flex-shrink-0'
								viewBox='0 0 20 20'
								fill='currentColor'
							>
								<path
									fillRule='evenodd'
									d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
									clipRule='evenodd'
								/>
							</svg>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<span className='mx-4 text-[12px] sm:text-[14px]'>
											{truncatedText}
										</span>
									</TooltipTrigger>
									{text.length > 60 && <TooltipContent>{text}</TooltipContent>}
								</Tooltip>
							</TooltipProvider>
						</div>
					);
				})}
			</div> */}

			<div className='mb-4'>
				<p className='text-darkColor dark:text-lightColor text-sm opacity-90 sm:min-h-[5rem]'>
					{plan.description[locale]}
				</p>
				{/* <p className='text-xl font-bold mt-2'>{plan.price[locale]}</p> */}
			</div>
			<Accordion
				type='single'
				collapsible
				className='w-full mb-6 sm:min-h-[720px]'
			>
				{plan.items.map((item: any, itemIndex: number) => {
					const text = item[locale];
					const truncatedText =
						text.length > 145 ? `${text.slice(0, 145)}...` : text;

					return (
						<AccordionItem
							value={`item-${itemIndex}`}
							key={itemIndex}
							className='border-primaryColor'
						>
							<AccordionTrigger className='hover:text-primaryColor'>
								<span className='flex items-center'>
									<DynamicIcon
										icon={item.icon}
										className='text-primaryColor flex-shrink-0'
									/>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<span className='text-xs ml-2 text-darkColor dark:text-lightColor'>
													{truncatedText}
												</span>
											</TooltipTrigger>
											{text.length > 45 && (
												<TooltipContent>{text}</TooltipContent>
											)}
										</Tooltip>
									</TooltipProvider>
								</span>
							</AccordionTrigger>
							<AccordionContent>{item.description[locale]}</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>

			<div className='flex justify-center items-center gap-6 flex-col mt-8'>
				<Link
					href='https://form.jotform.com/242192994073362'
					passHref
					target='_blank'
					className='relative h-[50px] w-40 overflow-hidden border border-primaryColor bg-primaryColor text-darkColor shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:duration-500 after:absolute after:right-0 after:top-0 after:h-full after:w-0 after:duration-500 hover:text-primaryColor hover:before:w-2/4 hover:before:bg-darkColor hover:after:w-2/4 hover:after:bg-darkColor
				rounded-lg inline-flex text-[13px] items-center justify-center font-medium'
				>
					<span className='relative z-10 flex'>
						{t("i_want_to_start")} <ArrowRightIcon />
					</span>
				</Link>
				<Link
					href='#contact'
					className='relative h-[50px] w-40 overflow-hidden border border-primaryColor bg-transparent text-gray-700 dark:text-primaryColor shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:duration-500 after:absolute after:right-0 after:top-0 after:h-full after:w-0 after:duration-500 hover:text-darkColor hover:before:w-2/4 hover:before:bg-lightColor hover:after:w-2/4 hover:after:bg-lightColor hover:border-darkColor rounded-lg inline-flex text-[13px] justify-center items-center'
				>
					<span className='relative z-10'>{t("view_detail")}</span>
				</Link>
				{/* <Dialog>
					<DialogTrigger asChild>
						<Button
							variant='outline'
							className='relative h-[50px] w-40 overflow-hidden border border-primaryColor bg-lightColor text-darkColor shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:duration-500 after:absolute after:right-0 after:top-0 after:h-full after:w-0 after:duration-500 hover:text-darkColor hover:before:w-2/4 hover:before:bg-primaryColor hover:after:w-2/4 hover:after:bg-primaryColor hover:border-darkColor'
						>
							<span className='relative z-10'>{t("view_detail")}</span>
						</Button>
					</DialogTrigger>
					<DialogContent className='mx-auto max-w-[22rem] sm:max-w-md bg-white dark:bg-darkColor max-h-[95vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle className='text-2xl text-primaryColor'>
								{plan.title[locale]}
							</DialogTitle>
						</DialogHeader>
						<div className='mb-4'>
							<p className='text-sm text-muted-foreground'>
								{plan.description[locale]}
							</p>
							<p className='text-xl font-bold mt-2'>{plan.price[locale]}</p>
						</div>
						<Accordion type='single' collapsible className='w-full mb-6'>
							{plan.items.map((item: any, itemIndex: number) => {
								const text = item[locale];
								const truncatedText =
									text.length > 145 ? `${text.slice(0, 145)}...` : text;

								return (
									<AccordionItem
										value={`item-${itemIndex}`}
										key={itemIndex}
										className='border-primaryColor'
									>
										<AccordionTrigger className='hover:text-primaryColor'>
											<span className='flex items-center'>
												<DynamicIcon
													icon={item.icon}
													className='text-primaryColor'
												/>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span className='text-xs ml-2 text-darkColor dark:text-lightColor'>
																{truncatedText}
															</span>
														</TooltipTrigger>
														{text.length > 45 && (
															<TooltipContent>{text}</TooltipContent>
														)}
													</Tooltip>
												</TooltipProvider>
											</span>
										</AccordionTrigger>
										<AccordionContent>
											{item.description[locale]}
										</AccordionContent>
									</AccordionItem>
								);
							})}
						</Accordion>
						<Button
							className='relative h-[50px] w-40 overflow-hidden border border-primaryColor bg-primaryColor text-darkColor shadow-2xl transition-all before:absolute before:left-0 before:top-0 before:h-full before:w-0 before:duration-500 after:absolute after:right-0 after:top-0 after:h-full after:w-0 after:duration-500 hover:text-primaryColor hover:before:w-2/4 hover:before:bg-darkColor hover:after:w-2/4 hover:after:bg-darkColor
					mx-auto'
						>
							<span className='relative z-10 flex'>
								{t("i_want_to_start")}
								<ChevronRight className='ml-2 h-4 w-4' />
							</span>
						</Button>
					</DialogContent>
				</Dialog> */}
			</div>
		</div>
	);
};

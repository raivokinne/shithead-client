import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { LogIn, LogOut, Play, Trophy, UserPlus2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			delayChildren: 0.3,
			staggerChildren: 0.2,
		},
	},
};

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
	},
};

export default function Home() {
	const { user, logout, isAuthenticated } = useAuthStore();

	const handleLogout = async () => {
		try {
			await logout();
			toast({
				title: "Logged Out",
				description: "You have been successfully logged out.",
				duration: 2000,
			});
		} catch (error) {
			toast({
				title: "Logout Failed",
				description: "Please try again.",
				variant: "destructive",
				duration: 2000,
			});
		}
	};

	return (
		<div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-hidden">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.2 }}
				transition={{ duration: 1.5 }}
				className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"
			/>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="relative z-10 max-w-md w-full space-y-8"
			>
				<motion.div
					initial={{ opacity: 0, y: -50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center"
				>
					<h1 className="text-6xl font-black text-white mb-2 tracking-tighter">
						SHITHEAD
					</h1>
					<p className="text-lg text-neutral-400 font-light tracking-wide">
						THE CARD GAME CHALLENGE
					</p>
				</motion.div>

				<Card className="border-neutral-800 bg-neutral-900/30 backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.07)]">
					<CardHeader>
						<CardTitle className="text-center text-2xl text-white flex items-center justify-center gap-2">
							<Trophy className="w-6 h-6 text-neutral-300" />
							<span className="font-light">
								{user && isAuthenticated
									? `Welcome, ${user.name || user.displayName}`
									: "Welcome to Shithead"}
							</span>
						</CardTitle>
					</CardHeader>

					<CardContent>
						<motion.div
							variants={cardVariants}
							initial="hidden"
							animate="visible"
							className="space-y-4"
						>
							{isAuthenticated ? (
								<>
									<motion.div variants={itemVariants}>
										<Link to="/game">
											<Button
												className="w-full bg-white text-black hover:bg-neutral-200 transition-all duration-300"
												size="lg"
											>
												<Play className="mr-2 h-4 w-4" /> Start New Game
											</Button>
										</Link>
									</motion.div>

									<motion.div variants={itemVariants}>
										<Link to="/lobbies">
											<Button
												className="w-full bg-white text-black hover:bg-neutral-200 transition-all duration-300"
												size="lg"
											>
												<UserPlus2 className="mr-2 h-4 w-4" /> Join
											</Button>
										</Link>
									</motion.div>

									<motion.div variants={itemVariants}>
										<Link to="/profile">
											<Button
												variant="outline"
												className={cn(
													"w-full border-neutral-700 hover:bg-neutral-400 transition-all duration-300"
												)}
												size="lg"
											>
												<Users className="mr-2 h-4 w-4" /> Profile
											</Button>
										</Link>
									</motion.div>

									<motion.div variants={itemVariants}>
										<Button
											onClick={handleLogout}
											variant="ghost"
											className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all duration-300"
											size="sm"
										>
											<LogOut className="mr-2 h-4 w-4" /> Logout
										</Button>
									</motion.div>
								</>
							) : (
								<motion.div variants={itemVariants}>
									<Link to="/login">
										<Button
											className="w-full bg-white text-black hover:bg-neutral-200 transition-all duration-300"
											size="lg"
										>
											<LogIn className="mr-2 h-4 w-4" /> Login to Play
										</Button>
									</Link>
								</motion.div>
							)}
						</motion.div>
					</CardContent>
				</Card>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7, duration: 0.5 }}
					className="text-center space-y-2"
				>
					<p className="text-neutral-500 text-sm tracking-wider">
						STRATEGIZE • BLUFF • SURVIVE
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}

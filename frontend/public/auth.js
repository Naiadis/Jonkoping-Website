// Simple authentication status check
async function checkLoginStatus() {
	try {
		const response = await fetch("/api/check-auth", {
			credentials: "include",
		});

		if (response.ok) {
			const data = await response.json();
			if (data.authenticated && data.role === "admin") {
				document.getElementById("adminControls").style.display = "block";
				document.getElementById("logoutButton").style.display = "block";
				document.getElementById("loginDropdown").style.display = "none";
				return true;
			}
		}
		return false;
	} catch (error) {
		console.error("Error checking auth status:", error);
		return false;
	}
}

// Login and logout functions
async function handleLogin(username, password) {
	try {
		const response = await fetch("/api/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
			credentials: "include",
		});

		if (response.ok) {
			const data = await response.json();
			return data;
		}
		return null;
	} catch (error) {
		console.error("Login error:", error);
		return null;
	}
}

async function handleLogout() {
	try {
		const response = await fetch("/api/logout", {
			method: "POST",
			credentials: "include",
		});
		return response.ok;
	} catch (error) {
		console.error("Logout error:", error);
		return false;
	}
}

export { checkLoginStatus, handleLogin, handleLogout };

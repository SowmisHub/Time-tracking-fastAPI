// auth.js

const API_BASE_URL = "http://127.0.0.1:8000";

function showAuthError(message) {
    const el = document.getElementById("authError");
    if (!el) return;

    el.textContent = message;
    el.classList.remove("hidden");
    el.classList.add("shake");

    setTimeout(() => {
        el.classList.remove("shake");
    }, 500);
}

function hideAuthError() {
    const el = document.getElementById("authError");
    if (!el) return;

    el.textContent = "";
    el.classList.add("hidden");
}

function setFormLoading(formEl, loading) {
    if (!formEl) return;

    const btn = formEl.querySelector('button[type="submit"]');

    if (!btn) return;

    const text = btn.querySelector("span:first-child");
    const loader = btn.querySelector(".btn-loader");

    btn.disabled = loading;

    if (text) text.classList.toggle("hidden", loading);
    if (loader) loader.classList.toggle("hidden", !loading);
}

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");

    const forgotLink = document.getElementById("forgotPasswordLink");
    const googleBtn = document.getElementById("googleBtn");

    // Already logged in
    if (localStorage.getItem("token")) {
        window.location.href = "dashboard.html";
        return;
    }

    // Toggle Forms

    showSignup?.addEventListener("click", (e) => {
        e.preventDefault();

        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");

        hideAuthError();
    });

    showLogin?.addEventListener("click", (e) => {
        e.preventDefault();

        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");

        hideAuthError();
    });

    // LOGIN

    loginForm?.addEventListener("submit", async (e) => {

        e.preventDefault();

        hideAuthError();

        setFormLoading(loginForm, true);

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {

            const response = await fetch(`${API_BASE_URL}/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });

            const data = await response.json();

            if (!response.ok) {
                showAuthError(data.detail);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            window.location.href = "dashboard.html";

        } catch (err) {

            console.error(err);

            showAuthError("Unable to connect to server.");

        } finally {

            setFormLoading(loginForm, false);

        }

    });

    // SIGNUP

    signupForm?.addEventListener("submit", async (e) => {

        e.preventDefault();

        hideAuthError();

        setFormLoading(signupForm, true);

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;

        try {

            const response = await fetch(`${API_BASE_URL}/signup`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })

            });

            const data = await response.json();

            if (!response.ok) {
                showAuthError(data.detail);
                return;
            }

            alert("Account created successfully.");

            signupForm.reset();

            signupForm.classList.add("hidden");
            loginForm.classList.remove("hidden");

        } catch (err) {

            console.error(err);

            showAuthError("Unable to connect to server.");

        } finally {

            setFormLoading(signupForm, false);

        }

    });

    // Forgot Password

    forgotLink?.addEventListener("click", (e) => {

        e.preventDefault();

        alert("Forgot Password is not implemented in the FastAPI backend yet.");

    });

    // Google Login

    googleBtn?.addEventListener("click", (e) => {

        e.preventDefault();

        alert("Google Login is not implemented in the FastAPI backend.");

    });

});
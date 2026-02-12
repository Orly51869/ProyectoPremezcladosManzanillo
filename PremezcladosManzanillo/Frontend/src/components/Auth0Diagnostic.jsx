import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Auth0Diagnostic = () => {
    const {
        user,
        isAuthenticated,
        isLoading,
        getAccessTokenSilently,
        loginWithRedirect,
        logout,
        error
    } = useAuth0();

    const [accessToken, setAccessToken] = useState("");
    const [apiError, setApiError] = useState("");

    const domain = import.meta.env.VITE_REACT_APP_AUTH0_DOMAIN;
    const clientId = import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID;
    const audience = "https://premezclados-api.com"; // Hardcoded in Auth0ProviderWithNavigate

    useEffect(() => {
        const getToken = async () => {
            if (isAuthenticated) {
                try {
                    const token = await getAccessTokenSilently({
                        authorizationParams: {
                            audience: audience,
                            scope: "read:current_user",
                        }
                    });
                    setAccessToken(token);
                } catch (e) {
                    console.error("Error getting token", e);
                    setApiError(e.message);
                }
            }
        };
        getToken();
    }, [isAuthenticated, getAccessTokenSilently]);

    return (
        <div style={{ padding: "20px", fontFamily: "monospace", maxWidth: "800px", margin: "0 auto" }}>
            <h1>Auth0 Diagnostic Page</h1>

            <section style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
                <h2>Configuration</h2>
                <p><strong>Status:</strong> {isLoading ? "Loading..." : "Ready"}</p>
                <p><strong>Domain:</strong> {domain || "MISSING!"}</p>
                <p><strong>Client ID:</strong> {clientId || "MISSING!"}</p>
                <p><strong>Audience (Hardcoded):</strong> {audience}</p>
                <p><strong>Redirect URI (Origin):</strong> {window.location.origin}</p>
            </section>

            <section style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
                <h2>Authentication State</h2>
                <p><strong>Is Authenticated:</strong> {isAuthenticated ? "YES" : "NO"}</p>
                {user && (
                    <div>
                        <h3>User Profile</h3>
                        <pre style={{ background: "#f5f5f5", padding: "10px", overflowX: "auto" }}>
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>
                )}
                {error && (
                    <div style={{ color: "red" }}>
                        <h3>Auth Error:</h3>
                        <pre>{JSON.stringify(error, null, 2)}</pre>
                    </div>
                )}
            </section>

            <section style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
                <h2>Actions</h2>
                {!isAuthenticated ? (
                    <button
                        onClick={() => loginWithRedirect()}
                        style={{ padding: "10px 20px", background: "green", color: "white", border: "none", cursor: "pointer" }}
                    >
                        Log In (Redirect)
                    </button>
                ) : (
                    <button
                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                        style={{ padding: "10px 20px", background: "red", color: "white", border: "none", cursor: "pointer" }}
                    >
                        Log Out
                    </button>
                )}
            </section>

            {isAuthenticated && (
                <section style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
                    <h2>Token Test</h2>
                    {accessToken ? (
                        <div style={{ color: "green" }}>
                            Access Token obtained successfully! (Length: {accessToken.length})
                        </div>
                    ) : (
                        <div style={{ color: "orange" }}>
                            Waiting for token... {apiError && <span style={{ color: "red" }}>Error: {apiError}</span>}
                        </div>
                    )}
                </section>
            )}

            <section style={{ marginTop: "30px", fontSize: "0.9em", color: "#666" }}>
                <h3>Troubleshooting Tips:</h3>
                <ul>
                    <li>If <strong>Domain</strong> or <strong>Client ID</strong> is missing, check your Netlify Environment Variables.</li>
                    <li>If login redirects to a 404 or error page on Auth0, check <strong>Allowed Callback URLs</strong> in Auth0 Dashboard. It must include: <code>{window.location.origin}</code></li>
                    <li>If you get "Service not found" or similar token errors, check that the API Audience <code>{audience}</code> exists in your Auth0 APIs.</li>
                    <li>Currently running at: <code>{window.location.href}</code></li>
                </ul>
            </section>
        </div>
    );
};

export default Auth0Diagnostic;

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define the protected routes explicitly
const isProtectedRoute = createRouteMatcher(['/dashboard/(.*)']);

export default clerkMiddleware((auth,req)=>{
    if(isProtectedRoute(req)) auth().protect()
});

export const config = {
  matcher: [
    // Protect the dashboard route and its subroutes
    '/dashboard((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Optionally protect other routes as needed
  ],
};

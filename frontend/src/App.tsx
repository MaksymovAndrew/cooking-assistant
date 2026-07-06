import type { ReactElement } from "react";
import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { ROUTES } from "constants/routes";

import { PageSpinner } from "components/layout/PageSpinner";
import { PrivateRoute } from "components/layout/PrivateRoute";
import { ModalRoot } from "components/modals";
import { ThemeManager } from "components/theme/ThemeManager";
import { Toaster } from "components/ui/Toasts";

const LoginPage = React.lazy(() => import("pages/auth/LoginPage"));
const RegisterPage = React.lazy(() => import("pages/auth/RegisterPage"));
const HomePage = React.lazy(() => import("pages/home/HomePage"));
const ChangeMenuPage = React.lazy(() => import("pages/menu/ChangeMenuPage"));
const CreateMenuPage = React.lazy(() => import("pages/menu/CreateMenuPage"));
const MenuDetailsPage = React.lazy(() => import("pages/menu/MenuDetailsPage"));
const MenuPage = React.lazy(() => import("pages/menu/MenuPage"));
const NotFoundPage = React.lazy(() => import("pages/not-found/NotFoundPage"));
const IngredientsPage = React.lazy(
    () => import("pages/person-ingredients/IngredientsPage"),
);
const ProfilePage = React.lazy(() => import("pages/profile/ProfilePage"));
const SettingsPage = React.lazy(() => import("pages/settings/SettingsPage"));
const ChangeRecipePage = React.lazy(
    () => import("pages/recipes/ChangeRecipePage"),
);
const CreateRecipePage = React.lazy(
    () => import("pages/recipes/CreateRecipePage"),
);
const MainPage = React.lazy(() => import("pages/recipes/MainPage"));
const RecipeDetailsPage = React.lazy(
    () => import("pages/recipes/RecipeDetailsPage"),
);
const StatsPage = React.lazy(() => import("pages/statistics/StatsPage"));
const UserMenuPage = React.lazy(() => import("pages/user-menu/UserMenuPage"));
const UserRecipesPage = React.lazy(
    () => import("pages/user-recipes/UserRecipesPage"),
);

interface AppRoute {
    path: string;
    element: ReactElement;
}

const PRIVATE_ROUTES: AppRoute[] = [
    { path: ROUTES.home, element: <HomePage /> },
    { path: ROUTES.allRecipes, element: <MainPage /> },
    { path: ROUTES.myRecipes, element: <UserRecipesPage /> },
    { path: ROUTES.myMenus, element: <UserMenuPage /> },
    { path: ROUTES.addRecipe, element: <CreateRecipePage /> },
    { path: ROUTES.recipeDetails, element: <RecipeDetailsPage /> },
    { path: ROUTES.changeRecipe, element: <ChangeRecipePage /> },
    { path: ROUTES.stats, element: <StatsPage /> },
    { path: ROUTES.ingredients, element: <IngredientsPage /> },
    { path: ROUTES.allMenus, element: <MenuPage /> },
    { path: ROUTES.addMenu, element: <CreateMenuPage /> },
    { path: ROUTES.menuDetails, element: <MenuDetailsPage /> },
    { path: ROUTES.changeMenu, element: <ChangeMenuPage /> },
    { path: ROUTES.profile, element: <ProfilePage /> },
    { path: ROUTES.settings, element: <SettingsPage /> },
];

const App: React.FC = () => (
    <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.registration} element={<RegisterPage />} />
        <Route element={<PrivateRoute />}>
            {PRIVATE_ROUTES.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
            ))}
        </Route>
        <Route path={ROUTES.notFound} element={<NotFoundPage />} />
    </Routes>
);

const AppWrapper: React.FC = () => (
    <Router>
        <ThemeManager />
        <Suspense fallback={<PageSpinner />}>
            <App />
        </Suspense>
        <ModalRoot />
        <Toaster />
    </Router>
);

export default AppWrapper;

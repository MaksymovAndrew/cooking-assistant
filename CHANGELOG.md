# Changelog

One changelog for the whole project (backend + frontend).

How versioning works here:

The app has one shared version, kept in the root package.json, and it goes up by one each release.
A release bumps backend/package.json and/or frontend/package.json up to that shared number, but only
for the side it actually changed. The untouched side keeps its old number, so a package version just
means "the last release this package changed in" and may skip numbers. It is not strict SemVer.

Each version below lists what changed under Backend / Frontend / Project. A side that was not touched
in a release has no line.

Why we moved to this:

Before, the repo had three separate versions (root, backend, frontend) and three changelogs plus git
tags. For a two-app project that was more bookkeeping than it was worth, so we dropped the per-package
changelogs and the tags and now track everything here against one shared version.

## Unreleased

### Backend

- Added: Browsing recipes and menus, and their reference data (ingredients, recipe types, menu categories), no longer requires being logged in.
- Changed: API responses are now compressed, making pages that load a lot of data noticeably faster.

### Frontend

- Added: You can now browse the full recipe list, individual recipes, the full menu list, and individual menus without an account - look around before you decide to join.
- Changed: Logging in now returns you to the page you were trying to reach, instead of always sending you to the home dashboard.
- Changed: Browsing without an account now hides pantry- and calorie-tracking specific bits (the favourite button, ingredient availability, missing-ingredient reminders) and offers a "Log in" prompt in their place instead of a broken or misleading control.

## 4.0 - 2026-08-04

### Backend

- Added: Ingredients now carry a calorie value, and every recipe automatically totals its calories from its ingredients - you can also set your own value by hand instead of the automatic total.
- Added: You can set a personal daily calorie goal, and log what you've eaten from a recipe or menu to track it against that goal.
- Removed: The "servings" field on recipes, which never held a real value.
- Added: Filter recipes by a calorie range.
- Fixed: A menu's total calories now correctly show as unavailable, instead of a silently undercounted number, when one of its recipes has no calorie data.

### Frontend

- Added: Recipes now show their calorie count per portion (and the total for however many portions you're making), plus a calorie breakdown for each ingredient. The recipe form lets you set your own calorie value instead of the automatic total.
- Added: A "portions" stepper on the recipe page now scales both ingredient amounts and calories together.
- Added: A note reminding you that calorie values are estimates and you're responsible for checking accuracy.
- Changed: The old "portions" field on the recipe page has been replaced by a live calorie count.
- Changed: Recipe cards now show cooking time and calories instead of cooking time and creation date.
- Added: A new "Dietary" tab on your profile - set a daily calorie goal, see today's progress on a colour-coded ring (on track / close to your goal / over goal), review and delete today's logged entries, and browse a 7- or 30-day history chart with a streak counter for days you stayed on target.
- Added: A 5th "Kcal today" tile on the home dashboard shows today's progress at a glance and warns when you're close to or over your goal; crossing your goal also shows a one-time reminder for the day.
- Added: Your profile header now shows how many calories you've logged today.
- Fixed: Saving your profile no longer briefly flashes the page and resets you to the "My recipes" tab.
- Changed: Calorie numbers throughout the app now show thousands separators (e.g. "1,180 kcal"), including the "Kcal today" number on your profile.
- Added: A "Log intake" button on recipe and menu pages - log what you ate (with a portions stepper and a live running total) straight against today's goal, showing how much you've eaten today and how much is left, with a warning if it would put you over.
- Fixed: Logging intake from a recipe page now starts from however many portions you already had selected there, instead of always resetting to one.
- Changed: If a recipe's calories were set by hand, the ingredient list no longer shows a per-ingredient calorie breakdown that could conflict with that total - just a note that the total above is the one that counts.
- Changed: Cleaned up the recipe and menu pages - Favourite, Log intake, Edit and Delete now sit together in one row, and the "Viewing someone else's..." message was removed since it's no longer needed.
- Added: Menu pages now show total calories alongside cooking time and recipe count.
- Fixed: The calorie history chart (7/30 days) no longer looks squeezed or broken on smaller screens - it now scrolls smoothly with a visible drag handle when there isn't room to show every day at once.
- Changed: Your best streak in the history chart no longer counts today until the day is over, matching how the current streak already works - a still-in-progress day can no longer briefly claim a "best" it hasn't earned yet.
- Changed: Scrollbars across the app now have a subtle, polished look instead of being invisible.
- Changed: The calorie-estimate disclaimer on the Dietary tab now sits at the top of the page, above the goal and history cards, so you see it first.
- Fixed: Calorie totals and the history chart now roll over to the new day correctly if you leave a tab open across midnight, instead of staying stuck on the previous day until you reload.
- Added: Filter recipes by a calorie range, and recipes or menus that would put you over your remaining calories for today are highlighted in orange, on cards and on their own detail page.
- Fixed: The "you're over today's goal" reminder now reliably appears once per day instead of sometimes reappearing after restarting the app.
- Fixed: Saving your calorie goal no longer occasionally shows a duplicate error message.
- Fixed: A brief network hiccup while you're logged in no longer knocks you to an error screen.

## 3.9 - 2026-07-30

### Backend

- Added: Recipes can now be filtered by matching their name, not just by ingredient.

### Frontend

- Changed: The recipe search box now searches by recipe name instead of ingredient; searching by ingredient moved into the filter panel, where you can pick one or more specific ingredients from a searchable list.
- Changed: The recipe list now sorts by newest first by default (previously fastest cooking time first); both "Fast → long" and "Long → fast" are now optional sort chips you can apply and remove from the filter bar.
- Added: A recipe list filtered by type, cooking time, sort order, or pantry can now be shared or bookmarked - copying the page URL and opening it elsewhere restores the exact same filters.
- Added: Menu lists are now shareable and bookmarkable the same way, and the menu filter panel gained the same layout as the recipe one, with a removable chip for the active title search and a counter badge on the trigger.
- Fixed: Searching a list no longer clears the filters you already applied - a title, type, cooking time, sort order, or pantry filter now survives a search, and vice versa.
- Fixed: Filters no longer leak between pages - the recipe and menu lists each keep their own, so a menu title search can never be mistaken for a recipe ingredient search.
- Changed: Every search box in the app - recipes, menus, your pantry, the ingredient/recipe pickers on the recipe and menu forms, and the in-menu recipe search - now searches live as you type instead of requiring Enter, and shares the same look and a single "clear" (✕) button.
- Added: The add-to-pantry ingredient search now has a clear button, matching every other search box in the app.
- Added: Selected recipe types and ingredients (and, on menus, categories) now also show as removable chips next to your results, not just inside the filter panel.
- Fixed: Cramped spacing between the search bar and the row of active-filter chips below it.
- Fixed: An empty "no results" screen with two buttons could overflow off the edge of the screen on mobile.
- Fixed: Allergen labels on a recipe's page were slightly misaligned; they're now centered correctly.
- Added: The site now has a proper meta description, Open Graph and Twitter Card tags (including a preview image), and a `robots.txt`, so shared links (social media, job listings, etc.) show a real title, description, and preview instead of nothing.
- Fixed: Dragging an ingredient or recipe forward past other rows in the recipe/menu builder could drop it one position further than where you released it.

### Project

- Changed: Routine dependency maintenance - updated to the latest safe major versions across backend and frontend (including Zod 4 and Recharts 3); TypeScript and ESLint majors stay pinned for now due to peer-dependency conflicts in their own plugin ecosystems. A follow-up pass picked up a further round of safe patch/minor updates (axios, lucide-react, @swc/core, @vitejs/plugin-react-swc, and the Docker build action used by the deploy pipeline).
- Security: Closed a gap where the login rate limiter could be bypassed by rotating IPv6 addresses within the same subnet.
- Security: Pinned the patched releases of a nested build-tool dependency (`brace-expansion`) affected by a denial-of-service advisory. It only ever reached the development toolchain, never the deployed app.
- Security: The backend container now runs as an unprivileged user instead of root.
- Changed: The project is now licensed under the GNU AGPLv3 (previously the repository carried a GPLv3 license file while the README claimed MIT). The license file, the README, and all three package manifests now agree.
- Removed: Housekeeping - deleted code left orphaned by earlier refactors (a duplicated set of transactional-email strings, the validation schema for the removed recipe-type editor, an unused date-range helper and its translations, and an unreferenced image asset), and brought the developer documentation back in line with the current architecture.

## 3.8 - 2026-07-28

### Backend

- Added: The ingredient catalog has been rebuilt from 22 items to 739, covering meat, fish, dairy, grains, spices, sauces, and more, each with calorie data and Russian/Ukrainian/Polish name translations ready for future use.
- Changed: Ingredient units now follow the metric system (grams, kilograms, milliliters, liters, cloves, bunches, and more) instead of the old, partly imperial set.
- Changed: Pantry and purchase quantities can now be fractional (e.g. 0.5 kg), not just whole numbers.
- Removed: Old ingredients, recipes, menus, and pantry contents have been cleared to make room for the new catalog. Accounts, recipe types, and menu categories are unaffected.
- Fixed: Searching recipes by ingredient could show a recipe with only the matching ingredient listed instead of its full ingredient list.
- Added: Recipes can now be filtered to only the ones you can make right now with what's in your pantry.

### Frontend

- Added: The ingredient search in recipes and your pantry now lets you browse by category (Vegetables, Meat, Fish, and so on) instead of only searching by name - handy now that the catalog has hundreds of items.
- Added: Your pantry has a category filter, so you can quickly narrow the list down to just what you have in, say, Dairy or Spices.
- Added: A "From my pantry" filter on the recipe list shows only recipes you can make right now with what's already in your pantry, with a shortcut card on the home page.
- Added: A popup now lets you know when you sign in if anything in your pantry has expired, listing what needs attention with a shortcut to your pantry.

## 3.7 - 2026-07-24

### Backend

- Added: You can now update your profile's name and surname, and choose a profile avatar.
- Added: You can now permanently delete your account, with a password confirmation and a short lockout after repeated wrong attempts.

### Frontend

- Added: The "Edit profile" button on your Profile page now works - update your name, surname, and pick from a set of cooking-themed preset avatars, shown across your profile and the account menu.
- Added: Deleting your account from Settings now works - press and hold the Delete account button to confirm, then enter your password. Repeated wrong passwords temporarily lock the action, just like signing in, and a confirmation toast appears once the account is gone.
- Fixed: If your session can't be verified for a reason other than being signed out (e.g. a temporary server issue), you now see a proper error screen with a retry button instead of plain unstyled text.

## 3.6 - 2026-07-21

### Project

- Changed: Routine dependency maintenance - updated the GitHub Actions used by CI and deploy, and refreshed a batch of minor/patch library versions across the project.
- Security: Resolved a transitive dependency advisory (a denial-of-service issue in a nested `brace-expansion` package) via an audit fix.

## 3.5 - 2026-07-21

### Frontend

- Fixed: Typing into any text field on a phone no longer zooms the whole page in - form fields now use a large enough font to stay under the browser's auto-zoom threshold, including the recipe ingredient quantity, menu recipe search, and a few other fields missed on the first pass.
- Fixed: A very long recipe or menu title, or a description with a long unbroken word (e.g. a pasted link), no longer pushes the page sideways on narrow screens.
- Fixed: A recipe or pantry ingredient quantity field can now be cleared and retyped freely (e.g. to change "1" to "18") instead of snapping back to the old value on every keystroke; leaving it empty or entering something invalid reverts to the last saved amount once you move on.
- Fixed: The Cancel/Save button pairs on the recipe form, menu form, "Add ingredient", "Change password" and "Delete account" now stack full-width and centered on phones instead of being squeezed side by side; "Edit quantities"/"Add ingredient" on the Ingredients page get the same treatment.
- Fixed: The "What's new" popup no longer looks stretched and oversized when the phone is in landscape.
- Changed: A pantry item's purchase quantity in Purchase History is now read-only until you tap its edit button, so an accidental scroll or tap can no longer change a saved amount; its quantity and unit (e.g. "1333 g") now sit next to each other instead of being spread across the row.
- Changed: The "verify your email" banner on Home now shows "Later" before "Send email". On phones the message is also shorter and stays on one line next to its icon instead of wrapping, with the two buttons centered on their own row below; tablet and desktop keep the original single-line layout.
- Changed: The mobile bottom navigation bar now shows Ingredients instead of Settings - Settings is easy enough to find from Profile, and the pantry gets a direct tab.
- Fixed: The bottom navigation bar's icons no longer get squeezed as the browser's bottom safe area grows (e.g. as Chrome's address bar collapses on scroll) - the icon/label row now has a fixed height of its own, with the safe-area space absorbed by a separate empty strip below it instead of shrinking the icons' room.
- Added: A friendly error screen with a retry button and a link back home now appears if something goes wrong while navigating, instead of a raw browser error page.
- Added: A popup now appears when your device loses its internet connection, reminding you to check it; it closes on its own once you're back online.
- Fixed: With the theme set to "System", switching your device's light/dark mode while the app stays open now updates the app's theme right away instead of only on the next reload.
- Removed: The disabled Metric/Imperial toggle in Settings, since only metric units are supported.
- Fixed: Tabbing through an open dialog now stays inside it instead of escaping to the page behind it.
- Fixed: If logging out fails, the confirmation dialog now shows an error message instead of silently staying open.
- Fixed: The "Check pantry" link on a recipe's missing-ingredients notice now also shows for the recipe's own owner, not just visitors, matching the menu page's behavior.
- Changed: The average cooking time bars on the Stats page are now colored per recipe type, matching the donut chart above them.
- Fixed: Hovering a slice of the recipe/menu donut charts on the Stats page no longer shows the total count on top of the slice's tooltip.

## 3.4 - 2026-07-14

### Backend

- Fixed: Registering or logging in now shows the right message - "username already taken", "too many attempts, try again in X seconds", or a generic server error - instead of always saying the username is taken.
- Fixed: Name, surname, and username are trimmed of accidental leading/trailing spaces before being saved, so a stray space (e.g. from a keyboard autocomplete) can no longer create an account with an unusable username.
- Changed: Login and registration attempts are now rate-limited independently of each other, and per account rather than just by network address - so someone else failing to log in on the same wifi no longer locks out your account too. A coarser network-wide limit still applies on top, so spraying attempts across many different accounts from one address is still caught.
- Changed: After 5 failed login attempts you're locked out for 1 minute; a further 5 failed attempts locks you out for 5 minutes. The lockout resets automatically after 30 minutes without another failed attempt.
- Added: Registration now requires an email address, and passwords must be at least 8 characters with a letter, a number, and a special character.
- Added: A "forgot password" flow - request a reset link by email, then set a new password from it. Only accounts with a verified email can request one, every request gets the same response either way so it can't be used to check which emails are registered, requests are rate-limited whether or not they succeed, each link can only be used once, and the new password must differ from the current one.
- Added: A "change password" option for signed-in users - entering the wrong current password shows an inline error without signing you out, and the new password must differ from the current one.
- Added: Email verification - confirm your email via an emailed link, with a rate-limited "resend link" action if it's not yet verified. Every account always has an email now, so there's no separate "add email" step.
- Added: Registering logs you in immediately instead of sending you to the login page.
- Added: Logging in now accepts either your username or your email address.
- Changed: Every auth error now carries a stable error code alongside its message, so the app always shows the exact right explanation (e.g. "username already taken" vs "email already registered" vs "too many attempts") instead of guessing from the HTTP status.

### Frontend

- Fixed: Registering with a name, surname, or username that has a stray leading/trailing space no longer fails validation.
- Changed: The login lockout countdown bar now depletes smoothly instead of jumping once per second.
- Added: Registration now includes an email field, and the password field enforces the stronger password rule.
- Added: "Forgot password?" on the login page now leads to a real flow instead of doing nothing; the confirmation screen also explains that no email is sent for an unregistered or unverified address.
- Added: A working "Change password" option in Settings.
- Added: An "Email" row in Settings showing a verified/unverified badge and a "Send email" action to (re)send the verification link - throttled to once a minute, shared with the same action on the Home banner.
- Added: A dismissible banner on Home nudging you to verify your email, since password reset only works for a verified email.
- Added: Opening a verification link shows a confirmation screen that offers to continue straight into the app if you're already signed in, or to log in if you're not.
- Added: A username/email toggle on the login form, so you can sign in with whichever you remember.
- Changed: Successfully registering now takes you straight to the dashboard instead of the login page.
- Changed: Registration and login error messages are now specific to the actual cause instead of a generic guess based on the response status.
- Fixed: The login lockout after repeated failed attempts is now scoped to the account you're signing into, so on a shared device one account's lockout no longer blocks a different account from logging in.

## 3.3 - 2026-07-12

### Frontend

- Added: "All recipes", "My recipes", "All menus" and "My menus" now load 30 at a time with a "Load more" button, plus a "Showing X of Y" counter once there are more than 30 to show. Sorting and filters continue to work as before, now applied across the whole list rather than just what's currently loaded.
- Added: Menu statistics are now shown directly on the statistics page — a donut chart for menus per category plus totals and average cooking time by type.
- Changed: The statistics page has a cleaner card-based layout.
- Removed: PDF export has been removed from the statistics page; statistics are viewed on screen only.
- Added: A brand-new Home dashboard - now the default page after signing in - showing your recipe, menu and pantry counts, ingredients expiring soon, and your most recent recipes at a glance, plus quick actions for a new recipe or menu and a "What's new" popup.
- Added: A dark/light theme toggle, available from every page, that remembers your choice and otherwise follows your system preference.
- Added: A redesigned navigation bar now appears consistently across every page.
- Added: The sign-in and sign-up pages now link directly to each other.
- Added: The Home dashboard now greets you by name, and the avatar in the navigation bar shows your initials instead of a generic icon.
- Changed: The homepage now opens directly at the site's root address; "All recipes" moved to its own page reachable from the navigation bar, alongside "Menus", "Ingredients" and "Stats".
- Fixed: The "Expiring soon" panel and count on the Home dashboard now only include ingredients that are actually expiring soon or already expired, instead of sometimes showing fresh items or an inaccurate count.
- Fixed: Ingredient expiry dates on the Home dashboard are now calculated consistently regardless of your timezone.
- Fixed: A routing-library warning no longer appears in the browser console.
- Security: The build toolchain moved from Vite 5 to Vite 8, removing a vulnerable development-server dependency (esbuild) and making production builds several times faster.
- Fixed: The page scrollbar now follows the light/dark theme instead of staying a fixed gray.
- Changed: The "Unknown error" fallback message now goes through the translation system like every other user-facing text.
- Fixed: When several requests fail at once (for example the server becomes unreachable), the app now shows one error toast instead of stacking identical copies.
- Added: On phones the browser bars (status bar, address bar) now match the app theme - dark purple in the dark theme, light in the light theme - instead of staying white. Switching themes now shows a confirmation (the page reloads to apply it) so the bars are always painted correctly.
- Fixed: Tapping a card or button on a touch screen no longer leaves its hover highlight stuck (the "half-disappeared border" effect on iPhone); hover effects now apply only on devices with a real pointer.
- Changed: The top navigation bar now scrolls away with the page instead of staying pinned, so more of the screen is available for content. A "scroll to top" button appears once you've scrolled down, bringing the navigation bar back into view.
- Changed: Custom fonts (Fraunces, Inter, Geist Mono) are now bundled with the app instead of loaded from Google's CDN - faster first load, no external font requests, and only the font weights actually used are included.
- Changed: Upgraded to React 19 and React Router 7 (no visible change in behavior).
- Added: A bottom navigation bar on mobile and tablet screens (Stats, Menus, Recipes, Settings, Profile) restores full navigation and sign-out on small screens.
- Added: A new Profile page, reachable from the account menu and the mobile navigation bar, showing your name, recipe/menu counts, and tabs for My recipes, My menus, Favourites and Dietary (the last two are placeholders for a future release).
- Added: A new Settings page with sections for Appearance (the existing dark/light theme toggle), Language & region, Notifications and Account; Language, Units, Notifications and the account actions (change password, delete account) are visual previews for a future release.
- Added: A redesigned "Page not found" screen with a themed illustration and quick links back into the app.
- Changed: The account avatar now opens a menu with Profile, Settings and Logout, replacing the standalone logout button.
- Changed: The top navigation bar now shows Recipes, Menus, Ingredients and Stats; "My Menus" will resurface under the new Profile page later this release.
- Changed: Confirmation dialogs, toasts and the loading screen have a refreshed look as part of the ongoing visual redesign.
- Removed: The standalone "Recipe Types" page; recipe types remain available as a filter when browsing recipes.
- Changed: The sign-in and sign-up pages have a redesigned split layout with a themed illustration panel, matching the rest of the visual redesign.
- Added: A show/hide toggle on password fields on the sign-in and sign-up pages.
- Changed: Being temporarily locked out after too many failed sign-in attempts now shows a clearer warning with a live countdown, instead of a plain error message.
- Changed: "All recipes" and "My recipes" have a redesigned layout - a cleaner toolbar, a filters panel (cooking time range, sort, recipe type) that opens from one button instead of separate dropdowns, and removable filter chips showing what's currently applied.
- Removed: Filtering recipes by a date range has been removed from the recipe list filters.
- Changed: Recipe cards have a refreshed look shared between grid and compact list layouts.
- Changed: The recipe detail page has a redesigned two-column layout with a breadcrumb back to the recipe list.
- Added: The recipe detail page now shows which ingredients you already have in your pantry and how many you still need to buy.
- Added: A portions stepper on the recipe detail page scales ingredient quantities up or down live, for recipes with a numeric serving size.
- Changed: Adding ingredients when creating or editing a recipe now uses a searchable field (with the matching part of each name highlighted) instead of scrolling through every ingredient in the catalog.
- Changed: The recipe creation and edit forms have a refreshed look, matching the rest of the redesign.
- Changed: "All menus" and "My menus" have a redesigned layout matching the recipe lists - a cleaner toolbar, a category filter panel that opens from one button, and a removable filter summary showing what's currently applied.
- Changed: Menu cards have a refreshed look shared with recipe cards.
- Changed: The menu detail page has a redesigned two-column layout with a breadcrumb, a stats row (total cooking time and recipe count), and a search box to filter recipes within the menu.
- Added: A "Missing ingredients" panel on the menu detail page shows everything still needed to cook every recipe in the menu, combined across all of them.
- Changed: Adding recipes when creating or editing a menu now uses a searchable field (with the matching part of each title highlighted), showing your picks as removable chips, instead of a long list of toggle buttons.
- Changed: The menu creation and edit forms have a refreshed look, matching the rest of the redesign.
- Changed: The Ingredients page has a redesigned card grid - each ingredient shows a fresh/expiring-soon/expired badge, its quantity, allergens, shelf life and purchase date at a glance, plus a search box and an "Expiring soon" filter.
- Changed: Adding an ingredient to your pantry now uses a searchable field (with the matching part of each name highlighted) instead of a long list of toggle buttons, and quantities are now edited directly on each card instead of a separate screen.
- Changed: The statistics page has a redesigned layout with quick-glance totals (recipe/menu counts, average cooking time, most-used type and category) alongside the existing charts.
- Added: The statistics page now shows a bar chart of average cooking time by recipe type.
- Fixed: The "Menu Statistics" section no longer shows recipe-type cooking-time averages mislabeled as menu data; it now only shows real menu figures (menu count and menu count by category).
- Changed: The "My recipes" and "My menus" tabs on the Profile page show your own recipe and menu cards directly, with a "Load more" button once you have more than a page's worth.
- Fixed: The "New recipe"/"New menu" buttons on the recipe and menu list pages, and the "Try again" button on the recipe and menu detail error states, no longer show a raw untranslated key instead of their label.
- Fixed: The recent-recipe cards on the Home dashboard show the app's mark icon on their placeholder image (previously blank) and use a compact row layout on mobile, matching the rest of the card's design on larger screens.
- Fixed: Recipe and menu placeholder icons (on cards, the recipe detail page, and empty states across lists and the Profile page) now match the exact icons from the design instead of close-but-different stock icons.
- Fixed: The "New recipe"/"New menu" buttons no longer show an underline under their text.
- Fixed: On tablet and desktop, opening the recipe list's Filters panel no longer squeezes the "Max cooking time" field off the edge of the panel.
- Fixed: The navigation bar's Recipes, Menus, Ingredients and Stats icons, the account avatar's placeholder icon, the recipe/menu Edit and Delete button icons, the pantry's empty-state icon, and the recipe detail page's "Portions" icon now match the exact icons from the design instead of similar-but-different stock icons.
- Fixed: The Ingredients page no longer crashes when an ingredient has an allergen on record.
- Fixed: The donut charts on the statistics page no longer briefly appear as an incomplete ring while the page finishes loading.
- Changed: The "Menus" page now lives at `/all-menus` instead of `/menus`, matching "All recipes"'s `/all-recipes`.
- Fixed: The "My Menus" page heading now correctly says "My Menus" instead of "All Menus".
- Changed: The Home dashboard now matches the design across mobile, tablet and desktop - stat tiles are compact icon-free numbers below desktop, the "New menu"/"New recipe" actions and a bell icon for What's new move into one row at the bottom of the page, and a dedicated "What's new" card (opening the same full popup on click) appears next to Expiring soon on desktop.
- Changed: The "What's new" popup now lists 8 real highlights from past releases (the redesign, pantry-aware recipes, richer statistics, safer sign-in, instant list updates, the public launch, faster page loads, and private menus) instead of placeholder text, and opens as a bottom sheet on mobile instead of a centered dialog.
- Fixed: The "What's new" popup's scrollbar no longer pokes out past its rounded corner when the list is taller than the popup; the popup is also a bit wider on tablet and desktop.
- Changed: The menu detail page has been redesigned - owner actions (Edit, Favourite, Delete) now sit in the page header, sized consistently, and recipes appear as compact cards with the layout adapting cleanly across phone, tablet and desktop.
- Added: A menu's ingredient list now shows every ingredient it needs - both what you already have and what's still missing, with quantities - to anyone viewing the menu, not just its owner; an "Allergens across menu" section lists the allergens found across all its recipes.
- Changed: On a menu, "Go to pantry" now takes you straight to the pantry page to add ingredients yourself, instead of adding them automatically.
- Added: The menu detail page shows a star-rating panel for menus you own, matching the recipe page's rating display.
- Fixed: Delete and logout confirmation popups now center their icon, title, message and buttons.
- Added: On phones, menu and recipe subpages now show a back button with the page title (and an edit shortcut on menus you own) in place of the full navigation bar.
- Changed: The delete-menu confirmation now names the menu being deleted and clarifies that its recipes are kept.
- Changed: Recipe and menu cards show an allergen warning badge when any of their ingredients contain an allergen; menu cards now show how many recipes they contain.
- Added: The recipe and menu list pages show an active search chip and a "Clear filters" option, with a friendlier empty state when nothing matches your search or filters.
- Changed: The theme toggle is now icon-only, and the desktop navigation shows plain text links instead of icons.
- Changed: The Home dashboard now shows up to 9 recent recipes on desktop (4 on tablet, 2 on mobile), and switches to a two-column layout when a phone is rotated to landscape.
- Changed: Switching between light, dark and system theme now opens a redesigned confirmation showing the target theme, and reloads the app to apply it. A new "System" option follows your device's theme automatically.
- Changed: The "What's new" popup now shows a bullet next to each update, with the date placed under its description.
- Changed: Pantry "Edit quantities" and "Add ingredient" buttons now have icons; editing a quantity now saves and reverts that ingredient individually instead of saving every edited ingredient at once.
- Changed: Pantry expiry badges now show an icon (clock, checkmark or warning), and a card's border is highlighted when its ingredient is expiring soon or has expired.
- Changed: The "Add ingredient" dropdown flags allergen-containing ingredients with a dot, matching the recipe form's ingredient picker.
- Changed: The profile page now shows when the account was created and a "Favourites" count, and uses a redesigned, more compact layout on mobile. The profile, recipe and menu grids now use a consistent column count across screen sizes.
- Changed: Settings gained a subtitle, a "System" theme option, and a "Profile" row linking to the profile page.
- Added: The login page shows a decorative "Forgot password?" link; field labels no longer have trailing colons.
- Fixed: Deleting a recipe now names the recipe being deleted and clarifies it will be removed from any menus that include it.
- Fixed: The "scroll to top" button no longer overlaps the bottom navigation bar on mobile and tablet.
- Fixed: The account menu dropdown no longer lets page content (e.g. the Filters button) show through it.
- Fixed: A recipe's serving count and scaled ingredient quantities now show correctly on first load, instead of staying stuck at 1 serving until you used the +/- controls.
- Fixed: Background page scroll is now blocked while a filter panel or bottom sheet is open.
- Fixed: The statistics page no longer overflows horizontally on narrow phone screens.
- Fixed: Leaving a recipe or menu form with unsaved changes now asks "Discard changes?" no matter how you leave (navigation bar, breadcrumb, back button) - previously only the Cancel button warned, and any other way out silently lost your edits.
- Fixed: Submitting an incomplete recipe form now flags every missing field at once, each with its own message under the field - previously only one error showed at a time, and a filled field could be outlined red because a different one was empty.
- Fixed: The Home dashboard's "New menu"/"New recipe" action row no longer overflows past the edge of the page on narrow phone screens.
- Fixed: The profile tab row no longer shows a visible scrollbar on phones - it still swipes, just without the bar.
- Fixed: Avatar initials now scale with the avatar's size instead of staying a fixed small size regardless of how large the avatar is.
- Changed: The statistics "fastest/slowest" and "most/least" lists now always show up to three items, instead of only the ones exactly tied for the extreme value.
- Changed: Statistics now show cooking times in a compact "1h 25m" format that always fits on one line, including on phones.
- Changed: The "scroll to top" button now fades and scales in and out smoothly instead of appearing and disappearing abruptly.
- Fixed: The Settings page no longer lets you scroll past its last section into empty space.
- Changed: The Home dashboard has tighter spacing on desktop so it fits a laptop screen without a sliver of extra scroll.
- Fixed: Hovering an allergen-flagged recipe or menu card now keeps its amber border, instead of switching to the brand purple used for other cards.
- Added: Recipes and menus you own are now highlighted with a purple border in the "All recipes" and "All menus" lists too, not just on your own-content pages.

### Backend

- Changed: The recipe and menu list endpoints now return results in pages of 30 (with a total count) instead of the entire matching set in one response.
- Fixed: The statistics page's menu totals now always reflect every menu, not just the most recent 30.
- Changed: Internal lint configuration cleanup (no behavior change).
- Added: The session check now returns your name alongside your account id, so the frontend can greet you by name.
- Security: Updated vulnerable third-party libraries (a CRLF-injection fix in form-data, a DoS fix in js-yaml, and a file-read fix in the build tool's esbuild).
- Fixed: The "Servings" field on a recipe now correctly saves whatever was typed (e.g. "a full pot"), instead of silently discarding non-numeric answers.
- Added: The profile page now shows when an account was created.
- Changed: The pantry unit "gr" has been renamed to "g".

### Project

- Changed: The app now builds, tests and deploys on Node 22 LTS everywhere (CI, Docker images, engines) - Node 20 reached end of life.
- Added: Weekly automated dependency-update PRs (Dependabot) for both apps and the GitHub Actions workflows.
- Added: Stricter style linting - theme colors may only be defined in the design tokens file, no `!important` in component styles, plus nesting and specificity limits; ESLint additionally forbids stray `console` calls on the frontend and enforces exhaustive `switch` statements on both sides.
- Fixed: `npm run verify` now also runs the frontend stylelint, so the local gate matches CI exactly.
- Added: Every per-app npm command now also runs from the repository root (`lint:fix`, `stylelint:fix`, `test:coverage`, `build:backend`), and all scripts work identically on Windows, macOS and Linux.
- Added: `npm start` / `npm run dev` now serve the app on both localhost and the local network at once, so it can be opened on a phone with no extra command.
- Added: ESLint now blocks hardcoded API paths, hardcoded route paths, and magic numbers outside the constants files, on both sides.
- Changed: The backend now compiles with TypeScript's modern NodeNext module resolution, dropping two deprecated compiler flags and a manual type shim (no behavior change).
- Added: the release version now bumps itself - committing on a release branch automatically sets the version from the branch name (root always, plus only the sides that actually changed) and includes it in the same commit; `npm run bump` does the same by hand.
- Changed: A broader code-quality pass removed duplicated logic (recipe/menu search queries, list-pagination footer, validation helpers) and unused leftovers (orphaned translation keys, dead styles, an unused lint dependency) across the whole codebase, with no change in behavior.
- Added: The end-to-end test suite and its config are now covered by formatting and linting too (previously untouched by either), catching one real issue on the spot.
- Removed: Tailwind CSS has been fully removed from the frontend (config, PostCSS, the stylelint integration, and the dependency itself) now that every page and component has moved to SCSS modules; the base stylesheet and its Tailwind directives are gone too, with the remaining global reset, fonts and scrollbar styling folded into the SCSS entry point.
- Added: An end-to-end test suite (Playwright) now drives real login, recipe/menu/pantry, and theme-toggle flows through a browser on every PR, and separately visits every page of the app, exercises search/filter/sort on recipes and menus, checks that only a recipe or menu's owner can edit or delete it, and covers pantry purchase history and full ingredient removal.
- Added: Every repository (recipes, menus, users, pantry, recipe types, menu categories), including recipe/menu search, filtering and pagination, is now also tested against a real PostgreSQL database (Testcontainers) on every PR, catching SQL mistakes that mocked tests can't see.
- Fixed: Recipe and menu list pages now always report the correct total count for pagination, instead of occasionally showing it as text rather than a number internally.
- Changed: The account menu and the recipe/menu filter panels now share one close-on-outside-click/Escape hook instead of three duplicated copies of the same logic, with no change in behavior.
- Fixed: The end-to-end test suite's recipe, menu and pantry-ingredient helpers now type into the searchable ingredient/recipe pickers before selecting a result, matching the pickers introduced earlier in this release (they previously assumed the older toggle-button list and timed out selecting nothing).
- Fixed: The end-to-end test suite's pantry tests now click the real "Add ingredient"/"Add to pantry" buttons instead of a stale "Edit ingredients"/"Save" pair left over from before the Ingredients page redesign, and the "/profile" route check now looks for the page's own tab list instead of a "Profile" heading that was never actually rendered.
- Fixed: The "What's new" bell and card now actually clear once you've opened the popup, instead of always showing the same "new" count.
- Fixed: The same rounded-corner scrollbar issue fixed in the "What's new" popup is also fixed everywhere else it could occur - every bottom-sheet/dialog (pantry, purchase history, password/account settings) and every searchable ingredient/recipe dropdown.
- Changed: The mobile Home dashboard's stat tiles now show in the same order as tablet and desktop, so the order read aloud by a screen reader always matches what's on screen.
- Fixed: The end-to-end test suite's pantry-details tests now find each ingredient card by its own name instead of a list-item role the redesigned card grid never had, and the sort-order test no longer waits on a specific network response, only on the recipes actually reordering.

## 3.2 - 2026-06-27

### Frontend

- Added: Repeated failed login attempts now trigger an escalating lockout (1, then 5, 10, 30, and 60 minutes) with a live countdown shown on the form; the lockout survives a page refresh and is lifted immediately on a successful login.
- Added: Signing out now asks for confirmation first, and shows a "You have been logged out" confirmation toast.
- Changed: All modal dialogs (delete confirmations, purchase history, sign-out) and all toast notifications now share one consistent look and keyboard/click-outside behavior (Escape and click-outside close a dialog the same way everywhere).
- Fixed: Checking your session or signing out no longer shows a false "something went wrong" error pop-up.
- Added: The remaining untranslated text in the app (including the PDF report error message) now goes through the same translation system as the rest of the UI, and any new untranslated text is now caught automatically going forward.
- Security: Removed an unused PDF dependency (`jspdf`) that carried a critical vulnerability; PDF report export uses `@react-pdf/renderer` only and is unaffected.

### Backend

- Changed: Internal lint configuration cleanup (no behavior change).

## 3.1 - 2026-06-27

### Frontend

- Fixed: Logging in now shows a clear "A server error occurred" message instead of the misleading "incorrect username or password" message when the server itself fails.
- Fixed: A failed login attempt no longer shows a duplicate error pop-up on top of the inline message under the form.
- Added: Create/edit recipe and create/edit menu pages now use RTK Query mutations directly instead of legacy wrapper calls, so the cache invalidates automatically and no manual refetch is needed.
- Added: Successful delete and save operations (recipe, menu, pantry ingredient, ingredient quantities, purchase) now show a green confirmation toast.
- Added: All toast messages (success confirmations and the generic fallback error) are now driven by i18n keys, ready for future translation.

### Backend

- Changed: Error messages returned by the API are now defined in one shared place, so wording stays consistent everywhere a given error can occur.
- Changed: Success messages returned by the API (login, logout, create/update/delete menu, delete recipe, pantry operations) are now defined in one shared constants file, eliminating hardcoded strings across four controllers.

## 3.0 - 2026-06-26

### Frontend

- Added: Centralized app state - a Redux Toolkit store now backs the whole app: shared sign-in session state (checking / authed / unauthed / error - error is reserved for failed checks, unauthed only for explicit logout), plus a centralized server-data cache (RTK Query) for recipes, menus, ingredients, recipe types, menu categories, the pantry and the session, so data is fetched once and shared across pages and every list refreshes automatically after you add, edit, or delete.
- Added: App-wide toast notifications that confirm successful actions and surface failed requests, plus a single global manager for all pop-up dialogs, including the delete confirmations for recipes, menus and pantry items.
- Added: Session selectors (`selectSessionStatus`, `selectIsAuthed`, `selectIsChecking`, `selectHasSessionError`) as a separate co-located file - the established pattern for all future slices.
- Changed: Every page, list, detail view, the statistics page and the recipe and menu filters now read and write through the shared store and cache instead of per-page data fetching, with no change to how the app behaves.

### Project

- Added: A `git skip-checks <command>` helper (repo-local alias, auto-installed on `npm install`) runs a single git command with checks skipped, in any shell.
- Changed: A single `SKIP_CHECKS=1` flag now skips both the local git hooks and CI for one commit or push - on commit it auto-stamps `[skip-checks]` into the message so CI skips its jobs too (`SKIP_HOOKS=1` kept as a backward-compatible alias; the direct-push-to-main block still applies).
- Fixed: The pre-commit hook no longer reads the previous commit's message, so a `[skip-checks]` from an earlier commit can no longer wrongly skip checks on the next, unrelated commit.
- Fixed: `[skip-checks]` now skips CI on pull requests too (a gate job reads the commit message directly), so it no longer has to be repeated in the PR title.

## 2.7 - 2026-06-22

### Project

- Fixed: Deploy pipeline no longer reports a failed step when the migration job actually succeeded (bash set -e false-positive on the timeout guard).
- Added: `[skip-checks]` in a commit message or PR title now skips all CI jobs and local pre-commit hooks (for pure ops-only commits such as workflow files and docs).
- Fixed: Backend SonarJS lint no longer reports errors on compiled files in `dist/`.

## 2.6 - 2026-06-21

### Backend

- Added: A single `deploy-db` script runs database migrations and reference-data seeding in one process, used by the deploy migration job.

### Project

- Fixed: Migration job now reliably runs migrations and seeding on each deploy via a dedicated entry point, instead of mis-parsed shell arguments.
- Changed: Local git hooks accept a `SKIP_HOOKS=1` escape hatch to bypass linters/tests/build (the direct-push-to-main block still applies), and CI skips its check jobs when the commit message or PR title contains `[skip-checks]` while still reporting the required success status.

## 2.5 - 2026-06-21

### Project

- Changed: Deploy migration job points at an explicit command instead of the default web-server entry point (superseded by 2.6).

## 2.4 - 2026-06-21

### Project

- Fixed: GHCR image references now use lowercase owner name so Azure Container Apps can pull images correctly.

## 2.3 - 2026-06-21

### Project

- Fixed: Azure OIDC login now uses a GitHub environment subject, which is the only format Azure federated credentials support for tag-triggered deploys.

## 2.2 - 2026-06-21

### Project

- Fixed: Deploy pipeline now authenticates to Azure correctly on any `v*` tag push.

## 2.1 - 2026-06-21

### Project

- Fixed: Deploying a release tag (`v*`) from the `main` branch was blocked by the pre-push hook.

## 2.0 - 2026-06-21

### Project

- Added: Cooking Assistant is publicly available at https://cooking-assistant.app

## 1.43 - 2026-06-21

### Backend

- Added: Backend is now packaged as a Docker image (multi-stage build via tsup) and published to GitHub Container Registry on each release tag.
- Added: Database migrations and seed run automatically as a Container Apps Job on every deploy, before the new backend image goes live.

### Frontend

- Added: Frontend is built into a Docker image served by nginx, with a SPA fallback so deep links load correctly in production.

### Project

- Added: A `deploy.yml` GitHub Actions workflow that builds both images on a `v*` git tag, pushes them to GHCR, runs migrations, and updates both Azure Container Apps.

## 1.42 - 2026-06-21

### Backend

- Security: Added a global per-client request rate limit (both the window and the per-IP ceiling are configurable via env) on top of the stricter login/registration limit; throttled responses keep the standard JSON error shape.
- Security: Responses now send an HTTP Strict-Transport-Security (HSTS) header, and database connections use TLS in production - configurable, including a relaxed-CA option for managed Postgres providers.
- Security: The app refuses to start in production with default database credentials, now enforced for the migrate and seed scripts too, not just the web server.
- Changed: Backend code quality was brought up to the frontend's level - stricter type-aware linting, enforced import-layering boundaries, and large data-access files split into smaller focused modules. No change to API behavior.

### Frontend

- Security: Updated axios to a patched release and removed an unused build dependency, clearing known dependency advisories.
- Changed: Production builds now strip `console` and `debugger` statements.
- Changed: The custom ESLint complex-condition rule now reports in English instead of Russian.

## 1.41 - 2026-06-20

### Backend

- Fixed: Editing a menu now preselects the saved category and its recipes correctly.
- Fixed: Menu name search with special characters now works correctly; the server was decoding search terms a second time, which broke searches containing percent-signs and accented letters.
- Fixed: Setting a pantry ingredient's quantity to 0 now removes it from the pantry instead of leaving a row with zero quantity.
- Fixed: The update-pantry endpoint now correctly accepts 0 as a valid quantity (previously it rejected 0 with a validation error).

### Frontend

- Fixed: After creating or editing a recipe, the app now navigates to the main recipe list instead of briefly bouncing through the home redirect.
- Fixed: The recipe servings field is sent to the server as a number, not a string.
- Fixed: The pantry quantity editor now allows 0 as input, so you can remove an ingredient by setting its quantity to zero.
- Fixed: The search bar no longer risks clearing itself in a loop when navigating to the home page with no active search.
- Added: Pages, the chart, and the PDF renderer now load on demand instead of all at once; the initial page load is significantly faster.
- Changed: Renamed the `person-ingradients` source folder to `person-ingredients` (corrected spelling).
- Changed: ESLint architectural boundary rule promoted from warning to error - importing across disallowed layers now blocks CI.
- Changed: Frontend build added to the pre-push hook so a broken build cannot be pushed.
- Changed: CI test job now enforces an 80% coverage threshold (statements, branches, functions, and lines).

## 1.40 - 2026-06-20

### Backend

- Security: Your login session is now kept in a secure, httpOnly cookie set by the server, so it can no longer be read or stolen by scripts in the browser; signing out clears it.
- Security: You can no longer open or change another user's menu — every menu is private to the person who created it, and its "missing ingredients" are now worked out against your own pantry.
- Security: When you build a menu, the recipes you add are now checked to make sure they actually exist.
- Removed: Creating, editing, and deleting recipe types is temporarily withdrawn pending a future, safer system; recipe types are now a fixed reference list you can still browse and pick from when adding a recipe.

### Frontend

- Changed: Rebuilt the login and registration screens on the shared form components, added a password show/hide control, and translated every label, button, and validation message via a new `auth` namespace.
- Fixed: The registration form now blocks submission while any field is still invalid (previously an invalid form could slip through).
- Security: The app no longer keeps your login token in the browser - your session lives only in the secure cookie - and an expired session now returns you to the login screen instead of showing a broken page.
- Removed: The recipe-type management screens (add, edit, delete) are gone while that feature is temporarily withdrawn; the read-only recipe-type list remains.

## 1.39 - 2026-06-18

### Frontend

- Changed: refactored the recipes domain — filter and sort logic extracted into `useRecipeFilters` and `useRecipes` hooks, cooking-time formatting moved to `cookingTimeUtils`, `RecipeCard` and `RecipeTypeFilter` migrated to self-contained component folders, all visible strings translated via a new `recipes` i18n namespace.
- Changed: refactored the menu domain — filter state extracted into `useMenuFilters`, form state into `useMenuForm`, `MenuCard` and `MenuCategoryFilter` migrated to self-contained component folders, all visible strings translated via a new `menu` i18n namespace.
- Changed: refactored the ingredients domain — `IngredientsPage` decomposed from 528 lines into four focused sub-components (`IngredientList`, `IngredientSelector`, `QuantityEditor`, `DeleteConfirmModal`), pantry and quantity logic extracted into `useIngredientsData` and `useQuantityUpdates` hooks, expiration calculation deduplicated into `ingredientExpirationUtils`, `PurchaseHistoryModal` migrated to a self-contained component folder, all visible strings translated via a new `ingredients` i18n namespace.
- Changed: refactored the statistics domain — duplicate fetch and calculation logic extracted into `useRecipeStatistics` hook (shared between `StatsPage` and `StatsReport`), `StatsReport` converted from self-fetching to a pure props-based PDF component, all visible strings translated via a new `stats` i18n namespace.
- Added: `lint:fix` script in frontend that runs `eslint --fix` to auto-sort imports by group.
- Changed: moved lint-staged configuration to a dedicated `lint-staged.config.js` in the project root; frontend TypeScript files now go through `eslint --fix` before `prettier` on every commit, auto-correcting import order.
- Changed: finished the recipe-types screens - add, edit, and list now share one form, move between pages without full-page reloads, reuse the shared confirmation dialog for deletion, and are fully translated via a new `recipeTypes` namespace.
- Changed: extracted shared UI building blocks (a generic card, list-page layout, owner-action bar, checkbox filter, toggle-button group, and form fields) so the recipe and menu screens no longer duplicate each other; all forms now live under a single `forms` folder.
- Changed: centralised every route path, the auth-token storage key, and search-parameter keys into one `constants` module, and moved date and cooking-time formatting into shared, locale-aware helpers.
- Changed: translated the remaining hardcoded text - the "page not found" screen, the statistics PDF reports, and the search box - and made every date (recipe/menu cards and details, the pantry, purchase history, and PDF reports) follow the active language, registering a Cyrillic-capable PDF font so Russian/Ukrainian will render correctly once those languages are added.
- Fixed: the recipe and menu detail pages no longer show an untranslated "Error:" prefix when something fails to load.
- Security: removed a debug log on the login screen that printed the entered username and password to the browser console.

## 1.38 - 2026-06-17

Frontend:

- Changed: reorganised the shared UI components (header, search bar, date filter, confirmation dialog, private route guard) into self-contained folders with named exports.
- Changed: tightened the build and lint tooling - type-aware ESLint rules, import path aliases throughout, CSS linting (Stylelint) in CI and pre-commit, and a faster test transformer. No change to how the app looks or behaves.
- Added: translation groundwork for the shared interface elements (header navigation, search, date filter, confirmation dialog) - strings remain in English; the structure is in place for future languages.

## 1.37 - 2026-06-16

Frontend:

- Added: a frontend test suite (Jest + React Testing Library) that locks in current behaviour ahead of the upcoming UI refactor - unit tests for every API-layer function and the shared error helper, tests for the reusable UI components, and a behavioral smoke test for every page (login, registration, the recipe and menu lists, recipe and menu details, recipe and menu creation and editing, recipe types, the pantry, and statistics).

## 1.36 - 2026-06-16

Frontend:

- Added: a Jest + React Testing Library test setup (jsdom) so UI components can be unit-tested, with a first smoke test covering the confirmation modal.

## 1.35 - 2026-06-16

Backend:

- Changed: the API server now listens on port 3000 (previously 8080), and the default allowed CORS origin is now http://localhost:8080 (previously http://localhost:5173).

Frontend:

- Changed: the dev server now runs on port 8080 (previously 5173), and the default backend API URL is now http://localhost:3000 (previously http://localhost:8080).

## 1.34 - 2026-06-16

Frontend:

- Changed: ingredient-pantry and statistics HTTP calls extracted from their pages/components into `src/api/userIngredientsApi.ts` and `src/api/statsApi.ts`; paths centralised in `src/api/endpoints.ts`; pages and components no longer call axios directly or build hardcoded backend URLs for requests, completing the API-layer migration of every frontend domain.

## 1.33 - 2026-06-16

Frontend:

- Changed: menu and user-menu HTTP calls extracted from their pages into `src/api/menusApi.ts` and `src/api/menuCategoriesApi.ts`; `getRecipes()` added to `src/api/recipesApi.ts`; paths centralised in `src/api/endpoints.ts`; pages no longer call axios/fetch directly or reference hardcoded backend URLs.

## 1.32 - 2026-06-15

Frontend:

- Changed: recipe and recipe-type HTTP calls extracted from their pages into `src/api/recipesApi.ts`, `src/api/recipeTypesApi.ts`, and `src/api/ingredientsApi.ts`; paths centralised in `src/api/endpoints.ts`; pages no longer call axios/fetch directly or reference hardcoded backend URLs.

## 1.31 - 2026-06-15

Frontend:

- Changed: auth HTTP calls (login, register) extracted from LoginPage/RegisterPage into `src/api/authApi.ts`; paths centralised in `src/api/endpoints.ts`; pages no longer call axios directly or reference hardcoded backend URLs.

## 1.30 - 2026-06-15

Frontend:

- Added: shared axios client instance with configurable base URL (via `VITE_API_URL` env var) and automatic auth-token injection, establishing the API layer foundation for future migration of inline HTTP calls.

## 1.29 - 2026-06-14

Frontend:

- Added: strict linting, accessibility checks, and code-quality analysis (ESLint strict mode, jsx-a11y, SonarJS) enforced on every commit via pre-commit hook and in CI.
- Added: Prettier formatting enforced for all frontend TypeScript, TSX, and CSS files in CI and pre-commit.
- Added: aggregate root scripts (`lint`, `typecheck`, `test`, `build`, `verify`) to run checks across both packages from the repo root.

## 1.28 - 2026-06-14

Frontend:

- Fixed: frontend build and lint now pass with 0 errors (unused-variable, no-explicit-any, unused-catch-binding, and ban-ts-comment errors resolved).
- Fixed: removed unused Vite scaffold leftovers - vite.svg, react.svg, App.css, and 16 unreferenced Montserrat font variants.

## 1.27 - 2026-06-13

Backend:

- Fixed: editing a past purchase no longer overwrites the pantry stock with the sum of all
  purchases - it now adjusts the stock by the change, so ingredients you have already used up
  stay accounted for.
- Authorization now accepts only the `Bearer` scheme; a token sent under any other scheme is
  rejected with 401.
- The statistics page and the menu detail view load faster (their database queries no longer run
  one-by-one).

## 1.26 - 2026-06-13

Backend:

- Creating or editing a recipe now accepts the number of servings sent as text (the
  way the current app sends it), instead of rejecting it with a validation error.
- Adding pantry ingredients, updating their quantities, and building or editing a menu
  now reject duplicate items in a single request with a clear 400 error.
- Pantry quantities must be whole numbers: a fractional amount is rejected with a 400
  error instead of failing with a server error.
- Concurrent updates to the same pantry ingredient no longer race and lose changes.

Project:

- Documentation and release metadata fixes: the example JWT secret in the backend
  README now meets the required minimum length, and the lockfile versions match the
  current release.

Backend:

- Security: recipes and menus can now be edited and deleted only by their owner; a request against
  someone else's recipe or menu returns 404. Deleting a recipe type still removes all recipes of that
  type, and no longer fails with a server error when such a recipe is part of a menu.
- Login no longer reveals whether a login exists: unknown login and wrong password both return the
  same 401 "Invalid login or password". Registering an already taken login returns a clear 409 instead
  of a server error. Server errors no longer expose internal details to the client.
- Malformed list filters (recipe and menu search) are rejected with a clear 400 error instead of
  failing with a server error, and searching menus by a name containing "%" works correctly.
- Pantry fixes: lowering an ingredient quantity is now saved (previously it was silently ignored),
  and pantry and purchase quantities must be at least 1 (a zero-quantity ingredient simply should not
  exist in the pantry - remove it instead). Recipe ingredient amounts equal to 0 are rejected too, and
  the amount field is accepted under either of its two historical names on both create and update.
- Reliability: a dropped idle database connection no longer crashes the server, and frequent lookups
  got database indexes. `JWT_SECRET_KEY` must now be at least 32 characters (checked at startup).

## 1.24 - 2026-06-11

Backend:

- Switched password hashing from bcrypt to the API-compatible bcryptjs (same hash format, so existing
  passwords keep working). This removes bcrypt's vulnerable native build tooling and brings the whole
  project to zero dependency advisories.
- Made the allowed CORS origin configurable through the `CORS_ORIGIN` environment variable (defaulting to
  `http://localhost:5173`), so a deployed frontend no longer needs a code change.

## 1.23 - 2026-06-11

Backend:

- Replaced the single non-idempotent database.sql setup with versioned migrations (node-pg-migrate) and
  a separate, re-runnable seed step, and removed the legacy database.sql. The schema is now created and
  rolled back reproducibly with `npm run migrate up` / `down`, and reference and sample data are loaded with
  `npm run seed`. An already populated database can adopt the migrations without losing data via
  `npm run migrate up -- --fake`.
- Audited and patched dependency vulnerabilities: the root project is now clean, and the backend's
  remaining advisories are limited to bcrypt's native build tooling.

## 1.22 - 2026-06-11

Backend:

- Added schema validation (zod) for all request input, so malformed requests are rejected with a clear
  400 error instead of failing deeper. Unified every error response to the { error } shape (auth errors
  included) and added a JSON 404 for unknown routes. Environment variables are validated on startup.

## 1.21 - 2026-06-11

Backend:

- Hardened the server for production: security headers via helmet, rate limiting on the login and
  register endpoints, an explicit request body size limit, a /api/health check, structured logging
  with pino (replacing console), and graceful shutdown that drains the server and closes the database
  pool on SIGTERM/SIGINT.

## 1.20 - 2026-06-11

Backend:

- Upgraded the backend to Express 5. Async route handlers now rely on the framework's built-in
  promise-rejection forwarding, so the manual asyncHandler wrapper was removed. No API or behavior change.

## 1.19 - 2026-06-10

Backend:

- Added middleware unit tests and supertest HTTP integration tests covering routing, auth, and error
  responses. The Express app is now built through a createApp(controllers) factory so it can be
  exercised in tests without a database. No API or behavior change.

## 1.18 - 2026-06-10

Backend:

- Reorganized the backend so all source lives under backend/src/, with only tooling configs at the
  package root, and introduced path aliases (@domain/_, @application/_, @infrastructure/_,
  @controller/_, @routes/_, @middleware/_, @config/_, @test/_) so imports no longer use ../../.. chains.
  Pure structural change - no API or behavior change.

## 1.17 - 2026-06-10

Backend:

- Migrated the backend to TypeScript. The whole API is now statically type-checked, with no change to
  endpoints, response shapes, or status codes. The Jest suite (now ts-jest) was the safety net.

Project:

- Backend now runs via tsx (no build step); CI gained a typecheck job and the pre-commit hook runs it
  too, so type errors are caught before a commit. Prettier/lint-staged now target backend .ts files.

## 1.16 - 2026-06-10

Project:

- Added Husky git hooks: pre-commit runs the full local quality gate (lint-staged auto-formats staged
  backend .js files with Prettier, then runs backend ESLint, SonarJS lint, and tests with coverage)
  so broken code can never be committed; pre-push blocks accidental direct pushes to main.

## 1.15 - 2026-06-10

Backend:

- Added eslint-plugin-sonarjs (recommended config) to the backend lint, bringing SonarSource
  code-smell and bug-detection rules locally - no SonarCloud account required.
- Security: disabled the X-Powered-By response header (flagged by sonarjs), so the API no longer
  advertises that it runs on Express.

Project:

- Added a separate local SonarJS lint path: a dedicated backend ESLint config, a `lint:sonarjs`
  backend script, and a CI check, so pull requests show SonarJS separately from the regular backend
  ESLint job.

## 1.14 - 2026-06-10

Project:

- CI now runs once per change instead of twice: the workflow no longer triggers on pushes to
  release/\*\* branches (pull requests already cover them), so a release-branch PR shows three checks
  (format, lint, test) instead of six.

## 1.13 - 2026-06-10

Backend:

- Tightened the backend ESLint setup: added eslint-plugin-n for Node correctness,
  eslint-plugin-promise for async correctness, eslint-plugin-jest for the test files,
  eslint-config-prettier to avoid formatter conflicts, and stricter core rules (eqeqeq, no-var,
  prefer-const, curly, no-throw-literal). Declared engines.node ">=20".

## 1.12 - 2026-06-09

Backend:

- Added a Jest unit-test suite covering the backend use cases and domain entities with no database
  required. CI now runs coverage-enforced tests on every push and pull request, with an 80% minimum
  threshold for the backend business-logic unit-test scope.

## 1.11 - 2026-06-09

Project:

- Added GitHub Actions CI: runs the backend lint and the Prettier format check on every pull request to
  main and on pushes to main and release/\*\* branches.

## 1.10 - 2026-06-09

Backend:

- Fixed: editing a purchase record no longer inflates your pantry stock with other users' purchases of
  the same ingredient. The recalculated amount now counts only your own purchases. The whole update now
  runs in a single transaction, so a mid-operation failure no longer leaves the purchase and the pantry
  total out of sync.

## 1.9 - 2026-06-09

Backend:

- Reworked the backend into a layered (clean) architecture: domain entities, use cases, repository
  interfaces with a PostgreSQL implementation, and dependency injection via a composition root.
  Controllers are now thin HTTP adapters. SQL queries, response shapes, and status codes are
  preserved, aside from the security and reliability fixes noted below.
- Error responses are now uniformly { error: ... } across all endpoints (menu and menu-category errors
  previously returned { message: ... }).
- Security: the registration response and the users list no longer include the password hash.
- Recipe create/update/delete and recipe-type deletion are now atomic — each is wrapped in a single
  transaction, so a mid-operation failure no longer leaves partial data behind.
- Removed leftover dead code (a duplicate menu-category handler, an unused menu helper, a commented-out
  route, and an unreachable menus-by-category endpoint).

## 1.8 - 2026-06-08

Backend:

- The server now identifies the logged-in user from the auth token instead of the user id sent by the
  client (security hardening). No visible change for normal use.

## 1.7 - 2026-06-07

Project:

- Unified the comment style across the whole codebase (backend and frontend): removed the //? and //!
  prefixes, switched to plain // comments with a single space and a lowercase first letter (acronyms
  and proper nouns like JWT, SQL, URL, Express keep their case). Comments only - no code or behavior
  changed.

## 1.6 - 2026-06-04

Project:

- Normalized line endings to LF across the repo via .gitattributes (\* text=auto eol=lf), so files
  check out the same on every OS and prettier format:check stays stable on Windows and elsewhere.

## 1.5 - 2026-06-04

Backend:

- Reworked error handling. Every endpoint now runs through one shared error middleware that returns
  failures as { error: <message> } with a 500 status and logs them in one place, instead of each
  handler catching its own errors. Database transactions still roll back on failure.
- Menu and menu-category screens now show the real error text when something goes wrong. They used
  to return a generic "Server error" the frontend could not read; their responses now match the
  rest of the API.
- Changed the default database name from cooking_helper_final to cooking_helper. This only affects
  setups that rely on the fallback default; if you set DB_NAME in .env, nothing changes.

## 1.4 - 2026-06-03

Backend:

- Added ESLint (flat config) and a lint script. Existing dead/duplicate code is silenced with
  eslint-disable comments for now and left for a later cleanup.
- Reformatted all backend files with Prettier (4-space indent). No behavior change.

Project:

- Added Prettier with a shared config (.prettierrc, .prettierignore) and format / format:check
  scripts. Only the backend is formatted; the frontend is not touched yet.
- Started committing lockfiles and tool configs: removed package-lock.json and eslint.config.js
  from .gitignore so installs are reproducible and CI can run npm ci.

## 1.3 - 2026-06-03

Documentation and versioning cleanup. No product code changed.

Project:

- Switched to one shared version and this single changelog. Removed the backend and frontend
  changelogs and stopped using git tags.

Backend:

- Simplified the README: removed emoji and decorative formatting, trimmed to the essentials.

Frontend:

- Simplified the README the same way.

## 1.2 - 2026-06-03

Backend:

- Database credentials now come from environment variables (DB_USER, DB_PASSWORD, DB_HOST, DB_PORT,
  DB_NAME) instead of being hardcoded in db.js. The old values stay as fallback defaults, so existing
  setups keep working.
- Added backend/.env.example listing every variable to set.
- Stopped tracking backend/.env in git, so the JWT secret is no longer committed. On a fresh checkout,
  copy .env.example to .env and fill it in.

## 1.1 - 2026-04-26

Monorepo tooling and documentation. No product code changed.

Project:

- One npm install at the root now installs both apps, and npm start runs them together.
- Added the first READMEs and project notes.

## 1.0 - 2026-04-26

First release. A working full-stack cooking app.

Backend:

- Express API on port 8080 with JWT login (24h) and bcrypt passwords, PostgreSQL via pg.
- Recipes, recipe types, per-user pantry with purchase history, menu planning with missing-ingredient
  detection, and stats. Around 30 endpoints. Schema and seed data in backend/database.sql.

Frontend:

- React + TypeScript + Vite app with Tailwind and React Router.
- Auth, recipe/menu/pantry/type management, and a statistics page with charts and PDF export.

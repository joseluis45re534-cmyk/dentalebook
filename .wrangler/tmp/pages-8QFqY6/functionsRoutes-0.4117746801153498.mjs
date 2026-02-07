import { onRequestPost as __api_admin_products_bulk_ts_onRequestPost } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\admin\\products\\bulk.ts"
import { onRequestDelete as __api_admin_products__id__ts_onRequestDelete } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\admin\\products\\[id].ts"
import { onRequestPut as __api_admin_products__id__ts_onRequestPut } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\admin\\products\\[id].ts"
import { onRequestGet as __api_admin_orders_ts_onRequestGet } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\admin\\orders.ts"
import { onRequestPost as __api_admin_products_index_ts_onRequestPost } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\admin\\products\\index.ts"
import { onRequestGet as __api_analytics_dashboard_ts_onRequestGet } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\analytics\\dashboard.ts"
import { onRequestPost as __api_analytics_track_ts_onRequestPost } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\analytics\\track.ts"
import { onRequestPost as __api_auth_login_ts_onRequestPost } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\auth\\login.ts"
import { onRequestPost as __api_orders_confirm_ts_onRequestPost } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\orders\\confirm.ts"
import { onRequestPost as __api_orders_sync_ts_onRequestPost } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\orders\\sync.ts"
import { onRequestGet as __api_products__id__ts_onRequestGet } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\products\\[id].ts"
import { onRequestDelete as __api_scripts__id__ts_onRequestDelete } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\scripts\\[id].ts"
import { onRequestPut as __api_scripts__id__ts_onRequestPut } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\scripts\\[id].ts"
import { onRequestPost as __api_checkout_ts_onRequestPost } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\checkout.ts"
import { onRequestGet as __api_products_index_ts_onRequestGet } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\products\\index.ts"
import { onRequestGet as __api_scripts_index_ts_onRequestGet } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\scripts\\index.ts"
import { onRequestPost as __api_scripts_index_ts_onRequestPost } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\scripts\\index.ts"
import { onRequest as __api_admin__middleware_ts_onRequest } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\admin\\_middleware.ts"
import { onRequestGet as __feed_xml_ts_onRequestGet } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\feed.xml.ts"
import { onRequest as __api__middleware_ts_onRequest } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\api\\_middleware.ts"
import { onRequest as ___middleware_ts_onRequest } from "C:\\Users\\pc\\Downloads\\Digital-Listings\\Digital-Listings\\functions\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/admin/products/bulk",
      mountPath: "/api/admin/products",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_products_bulk_ts_onRequestPost],
    },
  {
      routePath: "/api/admin/products/:id",
      mountPath: "/api/admin/products",
      method: "DELETE",
      middlewares: [],
      modules: [__api_admin_products__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/admin/products/:id",
      mountPath: "/api/admin/products",
      method: "PUT",
      middlewares: [],
      modules: [__api_admin_products__id__ts_onRequestPut],
    },
  {
      routePath: "/api/admin/orders",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_orders_ts_onRequestGet],
    },
  {
      routePath: "/api/admin/products",
      mountPath: "/api/admin/products",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_products_index_ts_onRequestPost],
    },
  {
      routePath: "/api/analytics/dashboard",
      mountPath: "/api/analytics",
      method: "GET",
      middlewares: [],
      modules: [__api_analytics_dashboard_ts_onRequestGet],
    },
  {
      routePath: "/api/analytics/track",
      mountPath: "/api/analytics",
      method: "POST",
      middlewares: [],
      modules: [__api_analytics_track_ts_onRequestPost],
    },
  {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_ts_onRequestPost],
    },
  {
      routePath: "/api/orders/confirm",
      mountPath: "/api/orders",
      method: "POST",
      middlewares: [],
      modules: [__api_orders_confirm_ts_onRequestPost],
    },
  {
      routePath: "/api/orders/sync",
      mountPath: "/api/orders",
      method: "POST",
      middlewares: [],
      modules: [__api_orders_sync_ts_onRequestPost],
    },
  {
      routePath: "/api/products/:id",
      mountPath: "/api/products",
      method: "GET",
      middlewares: [],
      modules: [__api_products__id__ts_onRequestGet],
    },
  {
      routePath: "/api/scripts/:id",
      mountPath: "/api/scripts",
      method: "DELETE",
      middlewares: [],
      modules: [__api_scripts__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/scripts/:id",
      mountPath: "/api/scripts",
      method: "PUT",
      middlewares: [],
      modules: [__api_scripts__id__ts_onRequestPut],
    },
  {
      routePath: "/api/checkout",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_checkout_ts_onRequestPost],
    },
  {
      routePath: "/api/products",
      mountPath: "/api/products",
      method: "GET",
      middlewares: [],
      modules: [__api_products_index_ts_onRequestGet],
    },
  {
      routePath: "/api/scripts",
      mountPath: "/api/scripts",
      method: "GET",
      middlewares: [],
      modules: [__api_scripts_index_ts_onRequestGet],
    },
  {
      routePath: "/api/scripts",
      mountPath: "/api/scripts",
      method: "POST",
      middlewares: [],
      modules: [__api_scripts_index_ts_onRequestPost],
    },
  {
      routePath: "/api/admin",
      mountPath: "/api/admin",
      method: "",
      middlewares: [__api_admin__middleware_ts_onRequest],
      modules: [],
    },
  {
      routePath: "/feed.xml",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [__feed_xml_ts_onRequestGet],
    },
  {
      routePath: "/api",
      mountPath: "/api",
      method: "",
      middlewares: [__api__middleware_ts_onRequest],
      modules: [],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]
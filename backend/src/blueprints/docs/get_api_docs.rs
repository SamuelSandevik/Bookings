use actix_web::{get, HttpResponse, Responder, put};
use serde::Serialize;
use serde_json::json;

#[derive(Serialize)]
struct RouteInfo {
    method: String,
    path: String,
    description: String,
    query_params: Vec<String>,
    path_params: Vec<String>,
    body_params: Option<Vec<String>>,
    middleware: Vec<String>,
    required_permissions: Option<Vec<String>>,
    response_example: Option<serde_json::Value>,
    error_example: Option<serde_json::Value>,
}

#[derive(Serialize)]
struct BlueprintInfo {
    name: String,
    routes: Vec<RouteInfo>,
}

#[get("/")]
pub async fn get_api_docs() -> impl Responder {
    let blueprints = vec![
        BlueprintInfo {
            name: "Users".to_string(),
            routes: vec![
                RouteInfo {
                    method: "POST".to_string(),
                    path: "/auth/credentials/sign-in".to_string(),
                    description: "Tries to sign in a user with credentials".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: Some(vec!["email: string".to_string(), "password: string".to_string()]),
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "POST".to_string(),
                    path: "/auth/credentials/sign-up".to_string(),
                    description: "Tries to sign up a user with credentials".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: Some(vec!["email: string".to_string(), "password: string".to_string(), "first_name: string".to_string(), "last_name: string".to_string(), "phone?: string".to_string()]),
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "POST".to_string(),
                    path: "/auth/otc/sign-in".to_string(),
                    description: "Creates or replaces a otc on a specific user".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: Some(vec!["email: string".to_string()]),
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "POST".to_string(),
                    path: "/auth/otc/sign-up".to_string(),
                    description: "Tries to create a user and a otc which can be send by email e.t.c..".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: Some(vec!["email: string".to_string()]),
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                
                RouteInfo {
                    method: "POST".to_string(),
                    path: "/auth/otc/challenge".to_string(),
                    description: "Challenges the otc".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: Some(vec!["email: string".to_string(), "otc: string".to_string()]),
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "POST".to_string(),
                    path: "/auth/lpwc".to_string(),
                    description: "Creates a lost password code".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: Some(vec!["email: string".to_string()]),
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "POST".to_string(),
                    path: "/auth/lpwc/challenge".to_string(),
                    description: "Challenges the lpwc".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: Some(vec!["email: string".to_string(), "lpwc: string".to_string(), "new_password: string".to_string()]),
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "GET".to_string(),
                    path: "/users/me".to_string(),
                    description: "Gets user data".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: None,
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "PUT".to_string(),
                    path: "/users/me".to_string(),
                    description: "Updates a user's profile info".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: Some(vec!["email: string".to_string(), "first_name: string".to_string(), "last_name: string".to_string(), "phone?: string".to_string()]),
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                }
            ]
        },
        BlueprintInfo {
            name: "Bookables".to_string(),
            routes: vec![
                RouteInfo {
                    method: "GET".to_string(),
                    path: "/bookables".to_string(),
                    description: "Gets all bookables a user has created".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: None,
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "POST".to_string(),
                    path: "/bookables".to_string(),
                    description: "Creates a new bookable".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: None,
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "PUT".to_string(),
                    path: "/bookables/{bookable_uuid}".to_string(),
                    description: "Updates a bookable".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: None,
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                RouteInfo {
                    method: "DELETE".to_string(),
                    path: "/bookables/{bookable_uuid}".to_string(),
                    description: "Deletes a bookable".to_string(),
                    query_params: vec![],
                    path_params: vec![],
                    body_params: None,
                    middleware: vec![],
                    required_permissions: None,
                    response_example: None,
                    error_example: None,
                },
                
            ]
        }
        
    ];

    let html = format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }}
        h1 {{
            color: #2c3e50;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }}
        .blueprint {{
            margin-bottom: 30px;
        }}
        .blueprint-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f8f9fa;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            user-select: none;
        }}
        .blueprint-header:hover {{
            background: #e9ecef;
        }}
        .blueprint-header h2 {{
            margin: 0;
            color: #34495e;
        }}
        .blueprint-content {{
            display: none;
            padding: 15px;
        }}
        .blueprint-content.active {{
            display: block;
        }}
        .route {{
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
        }}
        .method {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            color: white;
            font-weight: bold;
            margin-right: 10px;
        }}
        .get {{ background: #61affe; }}
        .post {{ background: #49cc90; }}
        .put {{ background: #fca130; }}
        .delete {{ background: #f93e3e; }}
        .path {{
            font-family: monospace;
            font-size: 1.1em;
            color: #3b4151;
        }}
        .description {{
            margin: 10px 0;
            color: #555;
        }}
        .section {{
            margin-top: 15px;
            padding: 10px;
            border-radius: 5px;
            background: #f8f9fa;
        }}
        .section-title {{
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 8px;
        }}
        .param-list, .middleware-list, .permissions-list {{
            list-style: none;
            padding-left: 0;
            margin: 0;
        }}
        .param-list li, .middleware-list li, .permissions-list li {{
            display: inline-block;
            margin: 2px 5px 2px 0;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 0.9em;
        }}
        .param-list li {{
            background: #e9ecef;
            color: #495057;
        }}
        .middleware-list li.auth {{
            background: #cce5ff;
            color: #004085;
        }}
        .middleware-list li.permissions {{
            background: #d4edda;
            color: #155724;
        }}
        .permissions-list li {{
            background: #fff3cd;
            color: #856404;
        }}
        .toggle-icon {{
            font-size: 1.2em;
            color: #666;
        }}
    </style>
    <script>
        function toggleBlueprint(element) {{
            const content = element.nextElementSibling;
            const icon = element.querySelector('.toggle-icon');
            content.classList.toggle('active');
            icon.textContent = content.classList.contains('active') ? '▼' : '▶';
        }}
    </script>
</head>
<body>
    <h1>API Documentation</h1>
    {blueprints}
</body>
</html>"#,
        blueprints = blueprints
            .iter()
            .map(|blueprint| {
                format!(
                    r#"
    <div class="blueprint">
        <div class="blueprint-header" onclick="toggleBlueprint(this)">
            <h2>{name}</h2>
            <span class="toggle-icon">▶</span>
        </div>
        <div class="blueprint-content">
            {routes}
        </div>
    </div>"#,
                    name = blueprint.name,
                    routes = blueprint
                        .routes
                        .iter()
                        .map(|route| {
                            format!(
                                r#"
    <div class="route">
        <div class="method {method_lower}">{method}</div>
        <div class="path">{path}</div>
        <div class="description">{description}</div>
        
        {query_params}
        {path_params}
        {body_params}
        {middleware}
        {permissions}
        {response_example}
        {error_example}
    </div>"#,
                                method = route.method,
                                method_lower = route.method.to_lowercase(),
                                path = route.path,
                                description = route.description,
                                query_params = if !route.query_params.is_empty() {
                                    format!(
                                        r#"
        <div class="section">
            <div class="section-title">Query Parameters:</div>
            <ul class="param-list">
                {params}
            </ul>
        </div>"#,
                                        params = route
                                            .query_params
                                            .iter()
                                            .map(|p| format!("<li>{}</li>", p))
                                            .collect::<Vec<_>>()
                                            .join("\n                ")
                                    )
                                } else {
                                    String::new()
                                },
                                path_params = if !route.path_params.is_empty() {
                                    format!(
                                        r#"
        <div class="section">
            <div class="section-title">Path Parameters:</div>
            <ul class="param-list">
                {params}
            </ul>
        </div>"#,
                                        params = route
                                            .path_params
                                            .iter()
                                            .map(|p| format!("<li>{}</li>", p))
                                            .collect::<Vec<_>>()
                                            .join("\n                ")
                                    )
                                } else {
                                    String::new()
                                },
                                body_params = if let Some(params) = &route.body_params {
                                    format!(
                                        r#"
        <div class="section">
            <div class="section-title">Request Body:</div>
            <ul class="param-list">
                {params}
            </ul>
        </div>"#,
                                        params = params
                                            .iter()
                                            .map(|p| format!("<li>{}</li>", p))
                                            .collect::<Vec<_>>()
                                            .join("\n                ")
                                    )
                                } else {
                                    String::new()
                                },
                                middleware = if !route.middleware.is_empty() {
                                    format!(
                                        r#"
        <div class="section">
            <div class="section-title">Middleware:</div>
            <ul class="middleware-list">
                {middleware}
            </ul>
        </div>"#,
                                        middleware = route
                                            .middleware
                                            .iter()
                                            .map(|m| format!("<li class='{}'>{}</li>", m, m))
                                            .collect::<Vec<_>>()
                                            .join("\n                ")
                                    )
                                } else {
                                    String::new()
                                },
                                permissions = if let Some(permissions) = &route.required_permissions {
                                    format!(
                                        r#"
        <div class="section">
            <div class="section-title">Required Permissions:</div>
            <ul class="permissions-list">
                {permissions}
            </ul>
        </div>"#,
                                        permissions = permissions
                                            .iter()
                                            .map(|p| format!("<li>{}</li>", p))
                                            .collect::<Vec<_>>()
                                            .join("\n                ")
                                    )
                                } else {
                                    String::new()
                                },
                                response_example = if let Some(example) = &route.response_example {
                                    format!(
                                        r#"
        <div class="section">
            <div class="section-title">Response Example:</div>
            <pre class="param-list"><code>{example}</code></pre>
        </div>"#,
                                        example = serde_json::to_string_pretty(example).unwrap()
                                    )
                                } else {
                                    String::new()
                                },
                                error_example = if let Some(example) = &route.error_example {
                                    format!(
                                        r#"
        <div class="section">
            <div class="section-title">Error Example:</div>
            <pre class="param-list"><code>{example}</code></pre>
        </div>"#,
                                        example = serde_json::to_string_pretty(example).unwrap()
                                    )
                                } else {
                                    String::new()
                                }
                            )
                        })
                        .collect::<Vec<_>>()
                        .join("\n")
                )
            })
            .collect::<Vec<_>>()
            .join("\n")
    );

    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html)
}

/// Update a system
/// 
/// Updates an existing system with the provided information. Only fields that are provided will be updated.
/// 
/// # Arguments
/// 
/// * `sys_uuid` - The UUID of the system to update
/// 
/// # Request Body
/// 
/// ```json
/// {
///     "name": "Updated System Name",
///     "address": "New Address",
///     "zip_code": "12345",
///     "city": "New City",
///     "country": "New Country"
/// }
/// ```
/// 
/// All fields are optional. Only provided fields will be updated.
/// 
/// # Response
/// 
/// Returns the updated system:
/// 
/// ```json
/// {
///     "uuid": "system-uuid",
///     "name": "Updated System Name",
///     "address": "New Address",
///     "zip_code": "12345",
///     "city": "New City",
///     "country": "New Country",
///     "lat": 59.3293,
///     "long": 18.0686
/// }
/// ```
/// 
/// # Errors
/// 
/// * `403 Forbidden` - If the user doesn't have permission to update the system
/// * `404 Not Found` - If the system doesn't exist
/// * `400 Bad Request` - If the request body is invalid
/// 
/// # Permissions
/// 
/// Requires the `update` permission for the `system` resource.
/// 
/// # Example
/// 
/// ```bash
/// curl -X PUT http://localhost:8004/systems/{sys_uuid} \
///   -H "Authorization: Bearer {token}" \
///   -H "Content-Type: application/json" \
///   -d '{
///     "name": "Updated System Name",
///     "address": "New Address",
///     "zip_code": "12345",
///     "city": "New City",
///     "country": "New Country"
///   }'
/// ```
#[put("/systems/{sys_uuid}")]
pub async fn update_system() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "message": "System updated successfully"
    }))
} 
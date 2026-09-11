<?php
// WarriorPlus IPN for Offer 94697 - LexAI Business AI - Kimi Code Deploy
// Set this URL in WarriorPlus Vendor -> Settings -> IPN: https://lexai.llc/webhook/warriorplus-ipn.php
// Products: 473669 BASIC $49 10 docs, 473682 SOLO $150 40 docs, 473683 TEAM $450 120 docs

$secret = 'YOUR_WPLUS_SECRET'; // From WarriorPlus Vendor Settings
$api_cost_per_doc = 1.33;

$txn_id = $_POST['txn_id'] ?? '';
$product_id = $_POST['product_id'] ?? '';
$email = $_POST['customer_email'] ?? $_POST['buyer_email'] ?? '';
$name = $_POST['customer_name'] ?? '';
$amount = $_POST['amount'] ?? 0;

$docs_map = [
  '473669' => 10,
  '473682' => 40,
  '473683' => 120
];

$docs = $docs_map[$product_id] ?? 0;
$api_cost = $docs * $api_cost_per_doc;
$profit_map = ['473669'=>9.48,'473682'=>17.15,'473683'=>52.05];
$profit = $profit_map[$product_id] ?? 0;

// TODO: Create user in your DB
// Example: createLexAIUser($email, $name, $docs, $product_id, $txn_id)

file_put_contents('ipn_log.txt', date('Y-m-d H:i:s')." - $txn_id - $product_id - $email - $docs docs - API \$$api_cost - Profit \$$profit\n", FILE_APPEND);

// Send access email
$login_url = "https://lexai.llc/business?offer=94697&plan=".($product_id=='473669'?'basic':($product_id=='473682'?'solo':'larger'))."&email=".urlencode($email)."&txn=$txn_id";
$subject = "LexAI Business AI - $docs Docs Activated - Offer 94697";
$message = "Hi $name,\n\nYour LexAI Business AI is active:\nPlan: $product_id - $docs docs\nLogin: $login_url\nVault: 10GB\nEngines: 16\nLanguages: EN/ES/PT/FR/JA/ZH/KO\n\nOverage: $2/doc after $docs docs\nSupport: support@lexai.llc\n\nOffer 94697 - $1.33/doc API cost covered - Profitable funnel";
mail($email, $subject, $message, "From: support@lexai.llc");

http_response_code(200);
echo "OK - $docs docs provisioned for $email - Profit \$$profit";
?>

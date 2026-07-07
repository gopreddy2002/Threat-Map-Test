import argparse
import urllib.parse


def build_dorks(target: str, mode: str = "domain") -> list[tuple[str, str]]:
    cleaned = target.strip().replace("https://", "").replace("http://", "").strip("/")
    if mode == "domain":
        cleaned = cleaned.split("/")[0]
        return [
            ("Exposed documents", f"site:{cleaned} filetype:pdf OR filetype:doc OR filetype:xls"),
            ("Directory listings", f"site:{cleaned} intitle:\"index of\""),
            ("Login portals", f"site:{cleaned} inurl:login OR inurl:admin OR intitle:login"),
            ("Config files", f"site:{cleaned} ext:env OR ext:conf OR ext:ini OR ext:log"),
            ("Public backups", f"site:{cleaned} ext:bak OR ext:old OR ext:backup OR ext:sql"),
            ("Error disclosure", f"site:{cleaned} \"stack trace\" OR \"syntax error\" OR \"warning:\""),
            ("Sensitive keywords", f"site:{cleaned} password OR token OR secret OR api_key"),
            ("Subdomains indexed", f"site:*.{cleaned} -site:www.{cleaned}"),
            ("Git exposure", f"site:{cleaned} inurl:.git OR inurl:.svn"),
            ("Cloud storage mentions", f"site:{cleaned} \"s3.amazonaws.com\" OR \"storage.googleapis.com\""),
        ]
    if mode == "email":
        return [
            ("Email mentions", f"\"{cleaned}\""),
            ("Paste mentions", f"\"{cleaned}\" site:pastebin.com OR site:ghostbin.com"),
            ("Credential context", f"\"{cleaned}\" password OR leaked OR breach"),
            ("Document mentions", f"\"{cleaned}\" filetype:pdf OR filetype:doc OR filetype:xls"),
        ]
    if mode == "company":
        return [
            ("Public documents", f"\"{cleaned}\" filetype:pdf OR filetype:ppt OR filetype:xls"),
            ("Hiring tech clues", f"\"{cleaned}\" \"AWS\" OR \"Azure\" OR \"Kubernetes\""),
            ("Exposed portals", f"\"{cleaned}\" inurl:login OR inurl:admin OR inurl:portal"),
            ("Code mentions", f"\"{cleaned}\" site:github.com OR site:gitlab.com"),
            ("Leaks and breaches", f"\"{cleaned}\" leaked OR breach OR credentials"),
        ]
    return [
        ("Exact keyword", f"\"{cleaned}\""),
        ("Documents", f"\"{cleaned}\" filetype:pdf OR filetype:doc OR filetype:xls"),
        ("Code repositories", f"\"{cleaned}\" site:github.com OR site:gitlab.com"),
        ("Past exposure", f"\"{cleaned}\" leak OR breach OR dump"),
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Google dork queries for authorized OSINT research.")
    parser.add_argument("target", help="Domain, company, email, or keyword to investigate")
    parser.add_argument("--mode", choices=["domain", "company", "email", "keyword"], default="domain")
    args = parser.parse_args()

    for name, query in build_dorks(args.target, args.mode):
        url = "https://www.google.com/search?q=" + urllib.parse.quote_plus(query)
        print(f"[{name}]\n{query}\n{url}\n")


if __name__ == "__main__":
    main()

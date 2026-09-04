from .analyzer import analyze_password


def print_finding(finding):
    print(f"\n[{finding.severity.upper()}] {finding.title}")
    print(f"  {finding.message}")


def print_analysis(result):
    print("\n" + "=" * 50)
    print("PASSWORDLENS ANALYSIS")
    print("=" * 50)

    print(f"\nPassword Strength : {result.strength.upper()}")
    print(f"Security Risk     : {result.risk.upper()}")

    print("\nComposition")
    print("-" * 50)
    print(f"Length            : {result.length}")
    print(f"Uppercase         : {'Yes' if result.has_uppercase else 'No'}")
    print(f"Lowercase         : {'Yes' if result.has_lowercase else 'No'}")
    print(f"Numbers           : {'Yes' if result.has_number else 'No'}")
    print(f"Symbols           : {'Yes' if result.has_symbol else 'No'}")

    print("\nSecurity Findings")
    print("-" * 50)

    if result.findings:
        for finding in result.findings:
            print_finding(finding)
    else:
        print("  No issues detected.")

    print("\n" + "=" * 50)
    print("Analysis complete.")
    print("=" * 50)


def main():
    print("=" * 50)
    print("PasswordLens")
    print("Explainable Password Security Analyzer")
    print("=" * 50)

    password = input("\nEnter a password to analyze: ")

    if not password:
        print("\nError: Password cannot be empty.")
        return

    exposure_choice = input(
        "\nCheck known breach exposure? [y/N]: "
    ).strip().lower()

    check_exposure = exposure_choice == "y"

    result = analyze_password(
        password,
        check_exposure=check_exposure,
    )

    print_analysis(result)


if __name__ == "__main__":
    main()
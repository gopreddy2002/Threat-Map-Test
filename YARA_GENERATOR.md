# YARA Rule Generator

The standalone `yara_rule_generator.py` script helps you quickly generate valid YARA rules from the command line without modifying the core ThreatMap application.

## Prerequisites

- Python 3.x

## Usage

```bash
python yara_rule_generator.py [-h] [-d DESCRIPTION] [-a AUTHOR] [-s STRINGS [STRINGS ...]] [-c CONDITION] [-o OUTPUT] name
```

### Positional Arguments
- `name`: Name of the YARA rule (alphanumeric and underscores only)

### Optional Arguments
- `-h, --help`: show this help message and exit
- `-d, --description`: Description of the rule
- `-a, --author`: Author of the rule
- `-s, --strings`: Strings to match. You can provide multiple strings separated by spaces. Use `{ 01 23 45 }` format for hex strings.
- `-c, --condition`: Condition for the rule (defaults to 'any of them' if strings are provided, else 'true')
- `-o, --output`: Output file to write the rule to. Prints to stdout if not specified.

## Examples

**1. Generate a basic rule and print to console:**
```bash
python yara_rule_generator.py MyRule -d "Detects malicious string" -a "Samarth" -s "evil_function" "http://malicious.com"
```

**2. Generate a rule with hex strings and save to a file:**
```bash
python yara_rule_generator.py HexDetect -d "Detects hex pattern" -s "{ E2 34 A1 C8 }" -o my_rule.yar
```

**3. Generate a rule with a custom condition:**
```bash
python yara_rule_generator.py CustomRule -s "string1" "string2" -c "$s0 and $s1"
```

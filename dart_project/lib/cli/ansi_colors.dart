/// Codes ANSI pour une sortie CLI élégante et colorée dans le terminal.
class Ansi {
  static const reset = '\x1B[0m';
  static const bold = '\x1B[1m';
  static const dim = '\x1B[2m';
  static const italic = '\x1B[3m';
  static const underline = '\x1B[4m';

  static const black = '\x1B[30m';
  static const red = '\x1B[31m';
  static const green = '\x1B[32m';
  static const yellow = '\x1B[33m';
  static const blue = '\x1B[34m';
  static const magenta = '\x1B[35m';
  static const cyan = '\x1B[36m';
  static const white = '\x1B[37m';

  static const bgGreen = '\x1B[42m';
  static const bgRed = '\x1B[41m';
  static const bgBlue = '\x1B[44m';
  static const bgCyan = '\x1B[46m';

  static String greenText(String s) => '$green$s$reset';
  static String redText(String s) => '$red$s$reset';
  static String yellowText(String s) => '$yellow$s$reset';
  static String cyanText(String s) => '$cyan$s$reset';
  static String boldText(String s) => '$bold$s$reset';
  static String dimText(String s) => '$dim$s$reset';
}

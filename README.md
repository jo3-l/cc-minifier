# Custom Command Minifier

> Drastically shortens YAGPDB custom command code: never worry about the character limit again.

See it in action [here](https://jo3-l.github.io/cc-minifier).

# How it works

The code is first subjected to a simple tokenization process, in which actions, strings, and plain text are separated.
Next, a number of transformations are applied to the tokens, such that the length of the code is reduced.
Finally, the tokens are reconstructed into code.

# Transformations available

- **removeIndents** - Removes indentation.
- **renameVariables** - Uses generated variable names, e.g., `a`, `b`, `c`, `d`, and so on.
- **shortenDeclarations** - Transforms `$a := b` to `$a:=b`, `$a = b` to `$a =b`, and`$a, $b := c` to `$a,$b:=c`.
- **stripComments** - Removes all comments from the code.
- **stripTrimMarkers** - Transforms `{{- ... -}}` to just `{{...}}`.
- **trimInActions** - Removes superfluous spaces in actions, e.g. `{{ a ( b ) }}` becomes `{{a (b)}}`.
- **trimStartAndEnd** - Trims spaces from the start and end of the code.
- **trimText** - Trims spaces from the start and end of all text. `{{hello}}\n{{world}}` becomes simply `{{hello}}{{world}}`, `{{hello}} foo {{bar}}` becomes `{{hello}}foo{{bar}}`, and so on.

Some transformations may alter the output of the code and are disabled by default. In particular, `stripTrimMarkers` and `trimText` may change the meaning of your code; use them with caution. **All other transformations should not change the meaning or output of the code at all and are enabled by default.**

# Directives

**Directives** are special comments that provide additional information to the minifier. All directives start with the prefix `@ym-`.

## Ignoring portions of the code

To mark portions of the code as untouchable by the minifier, use the `{{/* @ym-enable */}}` and `{{/* @ym-disable */}}` directives. For example:

```
{{/* @ym-disable */}}
{{$myConfigValue := 123}}
{{$myConfigValue2 := cslice 123 234}}
{{/* @ym-enable */}}

// more code...
```

...would leave the part of the code between `@ym-disable` and `@ym-enable` completely unchanged.

## Enabled/disabling transformations

To use a set of transformations that differ from the default, use the `{{/* @ym-config */}}` directive with a set of names of transformations prefixed by a `-` (disable) or `+` (enable). For example:

```
{{/* @ym-config +trimText, -shortenDeclarations */}}
```

...would enable the `trimText` transformer, disable the `shortenDeclarations` transformer, and use default values for all other transformers.

The `@ym-config` directive may appear anywhere in the code, but we recommend that you place it at the very start so it is easy to find.

# Contributing

If you spot a bug, feel free to open an issue or a PR.

# Author

**cc-minifier** is authored and maintained by Joe L. MIT License.

> Github [@Jo3-L](https://github.com/Jo3-L), Discord `Joe#6041`

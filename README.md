# Custom Command Minifier

> Never worry about the character limit again | http://jo3-l.github.io/cc-minifier</p>

# How it works
* Remove all comments
* Remove all spaces after `{{`
* Remove all spaces before `}}`
* Change `$x := y` to `$x:=y` (remove spaces before and after `:=`)
* Change `$x = y` to `$x =y` (remove spaces after `=`)
* Remove indentation
* Remove blank lines
* Trim the text
* Replace all variable names with randomly generated 1 or 2 character names

**Note:** The last step is the most likely to have issues (for example, let's say you have the code `{{ $num := 123 }} $num`). This will result in the second `$num` being changed as well. Without significant changes to the code, this is impossible to fix.

To stop the minifier from changing certain variable names, you can add `{{/* @ym-keep ...variable-names */}}` at the very top of your CC. For example, `{{/* @ym-keep num, num2 */}}` will stop the minifier from changing the variable names of `$num` and `$num2`.

# Contributing
If you spot a bug, feel free to open an issue or a PR.

# Author
**cc-minifier** is authored and maintained by Joe L. MIT License.
> Github [@Jo3-L](https://github.com/Jo3-L), Discord `Joe#6041`

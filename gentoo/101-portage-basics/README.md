# gentoo 101-portage-basics
- This lab will help you to understand basic concepts when working with the package manager for Gentoo, which is called `portage`

# Setup
- If you haven't already, follow the instructions in https://github.com/dyindude/vagrant-lab to install VirtualBox and Vagrant
- Download a copy of this repo, navigate to its folder and run `vagrant up`, followed by `vagrant ssh`
- You'll now be in a shell of a virtual machine configured for this lab.
- Many of the examples in this lab will require root access, so please run `sudo -i` after you gain shell access to the VM
- When you're done, if something in the lab messes up, or you just want to restart from scratch, type `exit` in the terminal to leave the SSH connection and run `vagrant destroy` from the project folder 

# equery
`equery` is the command you can use to query the list of installed packages on the system. It has a number of different modules that can be invoked to find packages by name, files on the filesystem, dependencies, etc:

```
# equery
Gentoo package query tool
Usage: equery [global-options] module-name [module-options]

global options
 -h, --help              display this help message
 -q, --quiet             minimal output
 -C, --no-color          turn off colors
 -N, --no-pipe           turn off pipe detection
 -V, --version           display version info

modules (short name)
 (b)elongs               list what package FILES belong to
 (c)hanges               list changelog entries for ATOM
 chec(k)                 verify checksums and timestamps for PKG
 (d)epends               list all packages directly depending on ATOM
 dep(g)raph              display a tree of all dependencies for PKG
 (f)iles                 list all files installed by PKG
 h(a)s                   list all packages for matching ENVIRONMENT data stored in /var/db/pkg
 (h)asuse                list all packages that have USE flag
 ke(y)words              display keywords for specified PKG
 (l)ist                  list package matching PKG
 (m)eta                  display metadata about PKG
 (s)ize                  display total size of all files owned by PKG
 (u)ses                  display USE flags for PKG
 (w)hich                 print full path to ebuild for PKG
```

The descriptions of each module give a general idea of what they can be used for:
```
# equery belongs /usr/bin/vim
 * Searching for /usr/bin/vim ... 
app-editors/vim-8.0.1298 (/usr/bin/vim)
```

The output of `equery belongs` will provide you with the name of the package in the form of what is referred to as a `package atom`. In this case, the atom is `app-editors/vim`, where:
- `app-editors` indicates the package `category`
- `vim` indicates the package name

It is good practice to use the full atom name when referring to a package in order to avoid ambiguity (in case there are similarly named packages in different categories, for example, `app-emulation/docker` and `x11-plugins/docker`)

Once armed with the knowledge of a `package atom`, it can be provided to the other `equery` modules to obtain information about the package:

```
# equery d app-editors/vim                                                                                
 * These packages depend on app-editors/vim:
app-vim/gentoo-syntax-20170225 (>=app-editors/vim-7.3)
virtual/editor-0 (app-editors/vim)
virtual/pager-0 (app-editors/vim[vim-pager])
# equery f app-editors/vim
 * Searching for vim in app-editors ...
 * Contents of app-editors/vim-8.0.1298:
/usr
/usr/bin
/usr/bin/rview -> vim
/usr/bin/rvim -> vim
/usr/bin/vim
/usr/bin/vimdiff -> vim
/usr/share
/usr/share/bash-completion
/usr/share/bash-completion/completions
/usr/share/bash-completion/completions/ex -> vim
/usr/share/bash-completion/completions/rview -> vim
/usr/share/bash-completion/completions/rvim -> vim
/usr/share/bash-completion/completions/vi -> vim
/usr/share/bash-completion/completions/view -> vim
/usr/share/bash-completion/completions/vim
/usr/share/bash-completion/completions/vimdiff -> vim
```

# Exercise 1
Find the `package atoms` associated with the following files:
- `/bin/bash`
- `/usr/x86_64-pc-linux-gnu/gcc-bin/6.4.0/gcc`
- `/usr/bin/which`
- `/usr/bin/watch`
- `/usr/bin/pstree`
- `/usr/bin/ansible`

With the resulting `package atoms`, use the other `equery modules` to learn information about the files, dependencies, `USE` flags, etc associated with these packages.

# emerge
`emerge` is the command used to install, remove, upgrade packages, as well as perform both package and dependent package rebuilds, systemwide rebuilds, etc.

```
emerge: command-line interface to the Portage system
Usage:
   emerge [ options ] [ action ] [ ebuild | tbz2 | file | @set | atom ] [ ... ]
   emerge [ options ] [ action ] < @system | @world >
   emerge < --sync | --metadata | --info >
   emerge --resume [ --pretend | --ask | --skipfirst ]
   emerge --help
Options: -[abBcCdDefgGhjkKlnNoOpPqrsStuvVw]
          [ --color < y | n >            ] [ --columns    ]
          [ --complete-graph             ] [ --deep       ]
          [ --jobs JOBS ] [ --keep-going ] [ --load-average LOAD            ]
          [ --newrepo   ] [ --newuse     ] [ --noconfmem  ] [ --nospinner   ]
          [ --oneshot   ] [ --onlydeps   ] [ --quiet-build [ y | n ]        ]
          [ --reinstall changed-use      ] [ --with-bdeps < y | n >         ]
Actions:  [ --depclean | --list-sets | --search | --sync | --version        ]

   For more help consult the man page.
```

The list of available packages is stored in a synced copy of the `portage tree` on your system (by default, this is stored in `/usr/portage`).

The portage tree can be updated with `emerge-webrsync`. This will compare the tree on the local system with the remote one on the Gentoo mirrors defined in `GENTOO_MIRRORS` in `/etc/portage/make.conf`, and download a new copy of the entire tree if it needs to be updated.

A common task on a gentoo system is to update all installed packages. There are special keywords that can be passed to `emerge` to reference systemwide sets of packages instead of individual package atoms:

- `@system` - the list of packages defined in the selected `profile` (you can see which portage `profile` is selected with `eselect profile show`. The name of the profile describes a subdirectory in `/usr/portage/profiles` which defines a lot of default settings such as what base OS packages are installed by default, default system and package-specific `USE` flags, masked packages that shouldn't be installed on the profile, etc:
  - `/usr/portage/profiles/default/linux/packages`
  - `/usr/portage/profiles/default/linux/packages.build`
  - `/usr/portage/profiles/default/linux/package.use`
  - (this is not a complete list, inspect the files in the profiles folder or read the Gentoo profiles documentation for more information)
- `@selected` - the list of packages that have been explicitly installed (that is to say, `selected`) by users installing packages via portage on the system. This list is stored in a file at `/var/lib/portage/world`
- `@world` - the combination of the list of packages defined in `@system` and `@selected`

Running `emerge --ask @selected`, for example, would tell portage to reinstall all packages listed in `@selected`. However, this would only attempt to explicitly install the packages in `@selected` and not check for `updates` on dependencies.

A commonly provided example of a command to update a gentoo system is `emerge -uDNav @world`. This is shorthand for:

`emerge --update --deep --newuse --ask --verbose @world`, which would tell portage:

- with the list of packages in the `@world` set:
  - `--update`: check if the package and/or immediate dependency packages need to be updated. do not reinstall/rebuild packages that already have the current version installed.
  - `--deep`: take the entire dependency tree into consideration, instead of only dependencies immediate to the packages in `@world`
  - `--newuse`: include packages whose `USE` flags have changed since the last time they were compiled.
  - `--ask`: prompt the user for a confirmation of whether or not to proceed with package rebuilds once the full list of affected packages has been gathered.
  - `--verbose`: enables verbose output for `portage`, which will spew the build process for each package to the screen, but also provides useful information in the output of the generated package list (like what `USE` flags are disabled for each affected package, etc)

Before we move on to the next lab, let's learn more about `USE` flags.

# USE flags
`USE` flags are variables that define what features get compiled into an individual package atom. For example:

```
# equery u app-editors/vim
[ Legend : U - final flag setting for installation]
[        : I - package is installed with flag     ]
[ Colors : set, unset                             ]
 * Found these USE flags for app-editors/vim-8.0.1298:
 U I
 - - X                              : Link console vim against X11 libraries to enable title and clipboard features in xterm
 + + acl                            : Add support for Access Control Lists
 - - cscope                         : Enable cscope interface -- in vim for example
 - - debug                          : Enable extra debug codepaths, like asserts and extra output. If you want to get
                                      meaningful backtraces see
                                      https://wiki.gentoo.org/wiki/Project:Quality_Assurance/Backtraces
 - - gpm                            : Add support for sys-libs/gpm (Console-based mouse driver)
 - - lua                            : Enable Lua scripting support
 - - luajit                         : Use dev-lang/luajit instead of dev-lang/lua
 - - minimal                        : Install a very minimal build (disables, for example, plugins, fonts, most drivers,
                                      non-critical features)
 + + nls                            : Add Native Language Support (using gettext - GNU locale utilities)
 - - perl                           : Add optional support/bindings for the Perl language
 - - python                         : Add optional support/bindings for the Python language
 - - python_single_target_python2_7 : Build for Python 2.7 only
 - - python_single_target_python3_4 : Build for Python 3.4 only
 + + python_single_target_python3_5 : Build for Python 3.5 only
 - - python_single_target_python3_6 : Build for Python 3.6 only
 + + python_targets_python2_7       : Build with Python 2.7
 - - python_targets_python3_4       : Build with Python 3.4
 + + python_targets_python3_5       : Build with Python 3.5
 - - python_targets_python3_6       : Build with Python 3.6
 - - racket                         : Enable support for Scheme using dev-scheme/racket
 - - ruby                           : Add support/bindings for the Ruby language
 - - tcl                            : Add support the Tcl language
 - - terminal                       : Enable terminal emulation support
 - - vim-pager                      : Install vimpager and vimmanpager links
```

In this output,
- the `U` column indicates whether or not the `USE` flag has been enabled in the `portage` configuration for the package
- the `I` column indicates whether or not the `USE` flag was enabled for this package the last time it was compiled
- a `+` indicates the flag is enabled in that column
- a `-` indicates the flag is disabled in that column

Similar information can be derived when using `emerge -av`:

```
app-editors/vim-8.0.1298::gentoo  USE="acl nls -X -cscope -debug -gpm -lua -luajit -minimal -perl -python -racket -ruby (-selinux) -tcl -terminal -vim-pager"
```

In this output (excerpt from `emerge -av app-editors/vim`), the keywords listed in `USE=` indicate features that have been compiled into the existing binary.
- a `-` prior to the flag name indicates the flag has been disabled.
- a `*` after the flag name would indicate that the enabled/disabled state of the flag has changed and the package will need to be recompiled to match the configuration defined in portage.
- the absence of a character before a `USE` flag in this list indicates that the package is already compiled with this flag enabled.

# Package scope USE flags
Let's assume that we've determined that the `lua` flag should always be enabled for `app-editors/vim` on this system, because we use `vim` plugins that rely on lua scripting support.

In this example, we don't particularly care whether or not `lua` gets compiled into other packages, we just want to ensure it does with `app-editors/vim`. In this case, we'll define `USE` flags at the package scope in the `portage` configuration.

Package scope `USE` flags are derived from files and subdirectories stored in the `/etc/portage/package.use` directory. For our example, we are only changing a single `USE` flag on a single package atom, but it's important to understand that every file in `/etc/portage/package.use` will be used to derive package scope `USE` flags for packages.

We can make our desired package scope `USE` flag change by placing the following line in a new file named `/etc/portage/package.use/vim`:

```
app-editors/vim lua
```

After making this change, the outputs of the commands in the previous section change as expected:

```
# equery u app-editors/vim
[ Legend : U - final flag setting for installation]
[        : I - package is installed with flag     ]
[ Colors : set, unset                             ]
 * Found these USE flags for app-editors/vim-8.0.1298:
 U I
 - - X                              : Link console vim against X11 libraries to enable title and clipboard features in xterm
 + + acl                            : Add support for Access Control Lists
 - - cscope                         : Enable cscope interface -- in vim for example
 - - debug                          : Enable extra debug codepaths, like asserts and extra output. If you want to get
                                      meaningful backtraces see
                                      https://wiki.gentoo.org/wiki/Project:Quality_Assurance/Backtraces
 - - gpm                            : Add support for sys-libs/gpm (Console-based mouse driver)
 + - lua                            : Enable Lua scripting support
 - - luajit                         : Use dev-lang/luajit instead of dev-lang/lua
 - - minimal                        : Install a very minimal build (disables, for example, plugins, fonts, most drivers,
                                      non-critical features)
 + + nls                            : Add Native Language Support (using gettext - GNU locale utilities)
 - - perl                           : Add optional support/bindings for the Perl language
 - - python                         : Add optional support/bindings for the Python language
 - - python_single_target_python2_7 : Build for Python 2.7 only
 - - python_single_target_python3_4 : Build for Python 3.4 only
 + + python_single_target_python3_5 : Build for Python 3.5 only
 - - python_single_target_python3_6 : Build for Python 3.6 only
 + + python_targets_python2_7       : Build with Python 2.7
 - - python_targets_python3_4       : Build with Python 3.4
 + + python_targets_python3_5       : Build with Python 3.5
 - - python_targets_python3_6       : Build with Python 3.6
 - - racket                         : Enable support for Scheme using dev-scheme/racket
 - - ruby                           : Add support/bindings for the Ruby language
 - - tcl                            : Add support the Tcl language
 - - terminal                       : Enable terminal emulation support
 - - vim-pager                      : Install vimpager and vimmanpager links
```

```
app-editors/vim-8.0.1298::gentoo  USE="acl lua* nls -X -cscope -debug -gpm -luajit -minimal -perl -python -racket -ruby (-selinux) -tcl -terminal -vim-pager"
```

In this example, we also see that invoking `emerge -av app-editors/vim` now pulls in `dev-lang/lua` as a dependency, since `dev-lang/lua` was not previously installed on the system:

```
# emerge -av app-editors/vim

 * IMPORTANT: 11 news items need reading for repository 'gentoo'.
 * Use eselect news read to view new items.


These are the packages that would be merged, in order:

Calculating dependencies... done!
[ebuild  N     ] dev-lang/lua-5.1.5-r4::gentoo  USE="deprecated readline -emacs -static" ABI_X86="(64) -32 (-x32)" 217 KiB
[ebuild   R    ] app-editors/vim-8.0.1298::gentoo  USE="acl lua* nls -X -cscope -debug -gpm -luajit -minimal -perl -python -racket -ruby (-selinux) -tcl -terminal -vim-pager" PYTHON_SINGLE_TARGET="python3_5 -python2_7 -python3_4 -python3_6" PYTHON_TARGETS="python2_7 python3_5 -python3_4 -python3_6" 0 KiB

Total: 2 packages (1 new, 1 reinstall), Size of downloads: 217 KiB

Would you like to merge these packages? [Yes/No] 
```

# Global scope USE flags
`USE` flags can also be defined globally by defining them in the `USE` variable in `/etc/portage/make.conf`.

Building on the previous example, let's assume that after reviewing the enabled `USE` flags for `app-editors/vim`, we've decided that on this system we don't have a real use for filesystem ACLs and want to disable the `acl` flag globally.

In `/etc/portage/make.conf`, `USE` has already been set with other globally-disabled flags:

```
USE="-gtk -gnome -qt4 -qt5 -kde -X"
```

By appending `-acl` to this list, the flag will be disabled globally in portage. After making this change, if `emerge` is invoked with `--newuse`, packages that were previously compiled with `acl` support will be added to the list of packages that need to be rebuilt without it:

```
# emerge --update --deep --newuse --ask --verbose @world

 * IMPORTANT: 11 news items need reading for repository 'gentoo'.
 * Use eselect news read to view new items.


These are the packages that would be merged, in order:

Calculating dependencies... done!
[ebuild   R    ] sys-apps/coreutils-8.28-r1::gentoo  USE="nls xattr -acl* -caps -gmp -hostname -kill -multicall (-selinux) -static {-test} -vanilla" 5,180 KiB
[ebuild   R    ] sys-devel/gettext-0.19.8.1::gentoo  USE="cxx ncurses nls openmp -acl* -cvs -doc -emacs -git -java -static-libs" ABI_X86="(64) -32 (-x32)" 19,243 KiB
[ebuild   R    ] sys-apps/sed-4.2.2::gentoo  USE="nls -acl* (-selinux) -static" 1,035 KiB
[ebuild   R    ] app-arch/tar-1.29-r3::gentoo  USE="nls xattr -acl* -minimal (-selinux) -static" 0 KiB
[ebuild  N     ] dev-lang/lua-5.1.5-r4::gentoo  USE="deprecated readline -emacs -static" ABI_X86="(64) -32 (-x32)" 217 KiB
[ebuild   R    ] app-editors/vim-core-8.0.1298::gentoo  USE="nls -acl* -minimal" 0 KiB
[ebuild   R    ] app-editors/vim-8.0.1298::gentoo  USE="lua* nls -X -acl* -cscope -debug -gpm -luajit -minimal -perl -python -racket -ruby (-selinux) -tcl -terminal -vim-pager" PYTHON_SINGLE_TARGET="python3_5 -python2_7 -python3_4 -python3_6" PYTHON_TARGETS="python2_7 python3_5 -python3_4 -python3_6" 0 KiB
[ebuild   R    ] net-misc/rsync-3.1.2-r2::gentoo  USE="iconv ipv6 xattr -acl* -examples -static -stunnel" 872 KiB
[ebuild   R    ] sys-libs/pam-1.2.1-r2::gentoo  USE="berkdb cracklib* filecaps nls pie -audit -debug -nis (-selinux) {-test}" ABI_X86="(64) -32 (-x32)" 0 KiB
[ebuild   R    ] sys-auth/pambase-20150213-r1::gentoo  USE="cracklib* nullok sha512 -consolekit -debug (-elogind) -gnome-keyring -minimal -mktemp -pam_krb5 -pam_ssh -passwdqc -securetty (-selinux) -systemd" 0 KiB
[ebuild   R    ] sys-apps/shadow-4.5::gentoo  USE="cracklib* nls pam xattr -acl* -audit (-selinux) -skey" LINGUAS="-cs -da -de -es -fi -fr -hu -id -it -ja -ko -pl -pt_BR -ru -sv -tr -zh_CN -zh_TW" 0 KiB

Total: 11 packages (1 new, 10 reinstalls), Size of downloads: 26,544 KiB

Would you like to merge these packages? [Yes/No] 
```

As you can see, globally disabling the `acl` flag has marked a number of other packages in `@world` for rebuilding.

# Exercise 2
Ensure you are in a shell on the machine provided for this lab with `vagrant ssh`.

Step through the configuration changes made in the examples since the first exercise:

- Run `emerge-webrsync` to sync the portage tree
- Run `emerge --update --deep --newuse --ask --verbose @world` and update any packages that need updates
- Enable the `lua` flag on `app-editors/vim` in /etc/portage/package.use/vim
- Disable the `acl` flag globally in `/etc/portage/make.conf`
- Run `emerge -uDNav @world` (remember this is the shorthand of the command ran previously) to apply both the package and global scope `USE` flag changes.

# Trivia
- `emerge-webrsync` is the modern, recommended method used for updating the `portage` tree, since it will download incremental diffs of the portage tree based on timestamped snapshots compared against the timestamp of the last time the portage tree was synced on this system.
- In comparison, `emerge --sync` still works, but it will recursively sync the entire portage tree with every invocation of the command.
- the `@selected` set, which contains the packages explicitly installed by users on the system (as opposed to packages defined in the `profile`), is stored in the oddly named `/var/lib/portage/world`
- package sets such as `@selected` can also be referenced when invoking `equery` for gathering information about packages

# Further reading
- https://wiki.gentoo.org/wiki/Gentoo_Cheat_Sheet#Package_installation_and_removal
- https://wiki.gentoo.org/wiki/System_set_(Portage)
- https://wiki.gentoo.org/wiki/Profile_(Portage)
- https://wiki.gentoo.org/wiki/Selected_set_(Portage)
- https://wiki.gentoo.org/wiki/World_set_(Portage)

# Cockpit Plugin for BlueChi

This is a [Cockpit](https://cockpit-project.org/) module for [Eclipse BlueChi](https://github.com/eclipse-bluechi/bluechi/).

# Development dependencies

On Debian/Ubuntu:

```bash
sudo apt install gettext nodejs npm make
```

On Fedora:

```bash
sudo dnf install gettext nodejs npm make
```

# Getting and building the source

These commands check out the source and build it into the `dist/` directory:

```bash
git clone https://github.com/engelmi/cockpit-bluechi.git
cd cockpit-bluechi
make
```

# Installing

`make install` compiles and installs the package in `/usr/local/share/cockpit/`. The
convenience targets `srpm` and `rpm` build the source and binary rpms,
respectively. Both of these make use of the `dist` target, which is used
to generate the distribution tarball. In `production` mode, source files are
automatically minified and compressed. Set `NODE_ENV=production` if you want to
duplicate this behavior.

For development, you usually want to run your module straight out of the git
tree. To do that, run `make devel-install`, which links your checkout to the
location were cockpit-bridge looks for packages. If you prefer to do
this manually:

```bash
mkdir -p ~/.local/share/cockpit
ln -s `pwd`/dist ~/.local/share/cockpit/cockpit-bluechi
```

After changing the code and running `make` again, reload the Cockpit page in
your browser.

You can also use
[watch mode](https://esbuild.github.io/api/#watch) to
automatically update the bundle on every code change with

```bash
./build.js -w
```

or

```bash
make watch
```

When developing against a virtual machine, watch mode can also automatically upload
the code changes by setting the `RSYNC` environment variable to
the remote hostname.

```bash
RSYNC=c make watch
```

When developing against a remote host as a normal user, `RSYNC_DEVEL` can be
set to upload code changes to `~/.local/share/cockpit/` instead of
`/usr/local`.

```bash
RSYNC_DEVEL=example.com make watch
```

To "uninstall" the locally installed version, run `make devel-uninstall`, or
remove manually the symlink:

```bash
rm ~/.local/share/cockpit/cockpit-bluechi
```

# Further reading

- [Cockpit Deployment and Developer documentation](https://cockpit-project.org/guide/latest/)
- [Make your project easily discoverable](https://cockpit-project.org/blog/making-a-cockpit-application.html)
